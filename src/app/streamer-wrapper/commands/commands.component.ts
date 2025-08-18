import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { ToastService } from '../../toast.service';
import { CommandsService } from '../../services/commands.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, List, LayoutGrid } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-commands',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule],
  templateUrl: './commands.component.html',
  styleUrl: './commands.component.css'
})
export class CommandsComponent implements OnInit, OnDestroy {
  user: User | null = null;
  commands: any[] = [];
  paginatedCommands: any[] = [];
  viewMode: 'table' | 'card' = 'table';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  itemsPerPageOptions = [5, 10, 15];
  totalPages: number = 1;

  newCommand: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    cmd: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
    description: new FormControl('', []),
    cooldown: new FormControl(10, [Validators.required, Validators.min(5), Validators.max(60)]),
    userLevel: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(10)]),
  });
  addingCommand: boolean = false;

  listIcon = List;
  gridIcon = LayoutGrid;

  userCommandsSettings = {
    viewMode: 'table',
    itemsPerPage: 5,
  }

  userLevels = {
    1: 'everyone',
    2: 'tier1',
    3: 'tier2',
    4: 'tier3',
    5: 'founders',
    6: 'vip',
    7: 'mod',
    8: 'editor',
    9: 'admin',
    10: 'streamer',
  }

  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
    private commandsService: CommandsService
  ) {
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    if (!this.user?.email) {
      this.toastService.error('Critical Error', 'User not found');
      new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
        this.router.navigate(['/']);
      });
      return;
    }

    const userCommandsSettings = localStorage.getItem('userCommandsSettings');
    if (userCommandsSettings) {
      this.userCommandsSettings = JSON.parse(userCommandsSettings);
      this.viewMode = (this.userCommandsSettings.viewMode as 'table' | 'card') ?? 'table';
      this.itemsPerPage = this.userCommandsSettings.itemsPerPage ?? 5;
    }

    this.commandsService.getUserCommands(this.user.id.toString()).subscribe((commands: any) => {
      this.commands = commands;
      this.updatePagination();
    });
  }

  ngOnDestroy() {
    this.cancelTooltip();
  }

  deleteCommand(commandId: string) {
    if (!commandId) {
      this.toastService.error('Action Not Allowed', 'You cannot delete a reserved command.');
      return;
    }

    if (confirm('Are you sure you want to delete this command?')) {
      this.commandsService.deleteCommand(commandId).subscribe((res: any) => {
        this.toastService.success('Command Deleted', 'The command has been deleted.');
        this.commands = this.commands.filter((command) => command._id !== commandId);
        this.updatePagination();
      });
    }
  }

  setView(mode: 'table' | 'card') {
    this.viewMode = mode;
    this.userCommandsSettings.viewMode = mode;
    localStorage.setItem('userCommandsSettings', JSON.stringify(this.userCommandsSettings));
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.commands.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCommands = this.commands.slice(startIndex, endIndex);
  }

  changePage(newPage: number) {
    if (newPage > 0 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePagination();
    }
  }

  onItemsPerPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
    this.updatePagination();
    this.userCommandsSettings.itemsPerPage = this.itemsPerPage;
    localStorage.setItem('userCommandsSettings', JSON.stringify(this.userCommandsSettings));
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  resetForm() {
    this.newCommand.reset();
    this.addingCommand = false;
  }

  testFunction(value: any) {
    console.log(value);
  }

  saveCommand(command: any) {
    if(command.invalid) {
      this.toastService.error('Invalid Form', 'Please fill in all fields.');
      return;
    }

    const newCommand = {
      name: command.value.name,
      cmd: command.value.cmd,
      func: command.value.cmd,
      message: command.value.message,
      description: command.value.description || null,
      cooldown: command.value.cooldown,
      userLevel: command.value.userLevel,
      userLevelName: this.userLevels[command.value.userLevel as keyof typeof this.userLevels],
      channel: this.userService.getLogin()
    }

    this.commandsService.createCommand(newCommand as any).subscribe({
        next: (res: any) => {
          this.commands.push(res);
          console.log(res);
          this.updatePagination();
          this.resetForm();
        },
        error: (err: any) => {
          this.toastService.error('Error', err.error.message);
        }
      });
  }

  // Tooltip logic for truncated cells
  tooltip = {
    visible: false,
    text: '',
    x: 0,
    y: 0,
  };

  private tooltipTimer: ReturnType<typeof setTimeout> | null = null;

  scheduleTooltip(text: string, event: MouseEvent) {
    this.cancelTooltip();
    const offset = 12;
    const x = event.clientX + offset;
    const y = event.clientY + offset;
    this.tooltipTimer = setTimeout(() => {
      this.tooltip.text = text;
      this.tooltip.x = x;
      this.tooltip.y = y;
      this.tooltip.visible = true;
    }, 1000);
  }

  cancelTooltip() {
    if (this.tooltipTimer) {
      clearTimeout(this.tooltipTimer);
      this.tooltipTimer = null;
    }
    this.tooltip.visible = false;
  }
}
