import { Component } from '@angular/core';
import { UserService } from '../../user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { ToastService } from '../../toast.service';
import { CommandsService } from '../../services/commands.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-commands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './commands.component.html',
  styleUrl: './commands.component.css'
})
export class CommandsComponent {
  user: User | null = null;
  commands: any = [];
  
  constructor(
    private userService: UserService,
    private router: Router,
    private toastService: ToastService,
    private commandsService: CommandsService
  ) {
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    if (!this.user.email) {
      this.toastService.error('Critical Error', 'User not found');
      new Promise((resolve) => setTimeout(resolve, 1000)).then(() => {
        this.router.navigate(['/']);
      });
    }

    this.commandsService.getUserCommands(this.user.id.toString()).subscribe((commands: any) => {
      this.commands = commands;
      console.log(this.commands);
    });
  }
}
