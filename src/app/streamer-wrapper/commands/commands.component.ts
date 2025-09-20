import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { UserService } from '../../user.service';
import { User } from '../../user';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastService } from '../../toast.service';
import { CommandsService } from '../../services/commands.service';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, List, LayoutGrid } from 'lucide-angular';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Command } from '../../interfaces/command';
import { TooltipDirective } from '../../tooltip/tooltip.component';
import { ConfirmationService } from '../../services/confirmation.service';
import { ThemesService } from '../../services/themes.service';

@Component({
  selector: 'app-commands',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule, ReactiveFormsModule, TooltipDirective],
  templateUrl: './commands.component.html',
  styleUrl: './commands.component.css'
})
export class CommandsComponent implements OnInit, OnDestroy, AfterViewInit {
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

  // Editable cell tracking
  editingCell: { commandId: string, field: string } | null = null;
  editingValues: { [key: string]: any } = {};

  // Row edit mode tracking
  editingRow: string | null = null;
  editingRowValues: { [key: string]: any } = {};

  // Card edit mode tracking
  editingCard: string | null = null;
  editingCardValues: { [key: string]: any } = {};

  // Focus management
  @ViewChild('editingInput', { static: false }) editingInput?: ElementRef;
  @ViewChild('newCommandRow') newCommandRow?: ElementRef;

  // Rate limiting
  private requestTimestamps: number[] = [];
  private readonly RATE_LIMIT_REQUESTS = 15;
  private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds in milliseconds
  private readonly RATE_LIMIT_BLOCK_DURATION = 60 * 1000; // 60 seconds
  private isRateLimited = false;
  private rateLimitEndTime = 0;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private commandsService: CommandsService,
    private confirmationService: ConfirmationService,
    private themeService: ThemesService
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

    // Initialize view mode with smart persistence
    this.initializeViewMode();

    this.commandsService.getUserCommands(this.user.id.toString()).subscribe((commands: any) => {
      this.commands = commands;
      this.updatePagination();
    });
  }

  ngOnDestroy() {
  }

  ngAfterViewInit() {
    // Focus the input after it's rendered
    if (this.editingCell && this.editingInput) {
      setTimeout(() => {
        this.editingInput?.nativeElement.focus();
      }, 10);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (this.editingCell) {
      const target = event.target as HTMLElement;
      const isEditingElement = target.closest('.editing-cell') !== null;
      if (!isEditingElement) {
        this.saveEdit();
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.editingCell && event.key === 'Enter') {
      event.preventDefault();
      this.saveEdit();
    } else if (this.editingCell && event.key === 'Escape') {
      event.preventDefault();
      this.cancelEdit();
    } else if (this.editingRow && event.key === 'Escape') {
      event.preventDefault();
      this.cancelRowEdit();
    }
  }

  @HostListener('document:focusin', ['$event'])
  onFocusIn(event: FocusEvent) {
    if (this.addingCommand && this.newCommandRow?.nativeElement.contains(event.target)) {
      const newCommandTr = this.newCommandRow?.nativeElement as HTMLTableRowElement;
      if (newCommandTr) {
        newCommandTr.classList.remove('light-mode-blink', 'dark-mode-blink');
      }
    }
  }

  @HostListener('document:focusout', ['$event'])
  onFocusOut(event: FocusEvent) {
    // Reapply blinking animation if leaving the new command row entirely and it's still in adding mode
    if (this.addingCommand && !this.newCommandRow?.nativeElement.contains(event.relatedTarget)) {
      const newCommandTr = this.newCommandRow?.nativeElement as HTMLTableRowElement;
      if (newCommandTr) {
        if (this.isDarkMode()) {
          newCommandTr.classList.add('dark-mode-blink');
        } else {
          newCommandTr.classList.add('light-mode-blink');
        }
      }
    }
  }

  async deleteCommand(commandId: string) {
    if (!commandId) {
      this.toastService.error('Action Not Allowed', 'You cannot delete a reserved command.');
      return;
    }

    // Check rate limit before proceeding
    if (!this.checkRateLimit()) {
      return;
    }

    let deleteConfirmed = await this.confirmationService.confirm({
      title: { EN: 'Delete Command', ES: 'Eliminar Comando' },
      message: { EN: 'Are you sure you want to delete this command?', ES: '¿Estás seguro de querer eliminar este comando?' },
      confirmText: { EN: 'Delete', ES: 'Eliminar' },
      cancelText: { EN: 'Cancel', ES: 'Cancelar' },
      variant: 'danger'
    });

    if (deleteConfirmed) {
      this.recordRequest();
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

    // Update all persistence layers
    this.saveViewModeState(mode);

    // Update URL without navigation
    // Only include page parameter if in table mode and not on page 1
    const pageParam = (mode === 'table' && this.currentPage > 1) ? this.currentPage : undefined;
    this.updateURL(mode, pageParam);
  }

  private initializeViewMode() {
    // Priority: URL > sessionStorage > localStorage > default
    const urlMode = this.getViewModeFromURL();
    const sessionMode = this.getViewModeFromSession();
    const localMode = this.getViewModeFromLocal();

    let finalMode: 'table' | 'card' = 'table';

    if (urlMode) {
      finalMode = urlMode;
    } else if (sessionMode) {
      finalMode = sessionMode;
      // Update URL to match session state (include page only if table mode)
      const pageParam = (sessionMode === 'table' && this.currentPage > 1) ? this.currentPage : undefined;
      this.updateURL(sessionMode, pageParam);
    } else if (localMode) {
      finalMode = localMode;
      // Update URL and session to match local state
      const pageParam = (localMode === 'table' && this.currentPage > 1) ? this.currentPage : undefined;
      this.updateURL(localMode, pageParam);
      this.saveToSession('viewMode', localMode);
    }

    this.viewMode = finalMode;
    this.userCommandsSettings.viewMode = finalMode;
    this.userCommandsSettings.itemsPerPage = this.getItemsPerPageFromLocal() ?? 5;
    this.itemsPerPage = this.userCommandsSettings.itemsPerPage;

    // Initialize page state only if in table mode
    if (finalMode === 'table') {
      this.initializePageState(finalMode);
    } else {
      // In card mode, ensure no page parameter in URL
      this.initializePageState(finalMode);
    }

    // Save current state to sessionStorage
    this.saveToSession('viewMode', finalMode);
  }

  private getViewModeFromURL(): 'table' | 'card' | null {
    const params = this.route.snapshot.queryParams;
    const mode = params['view'];
    return mode === 'table' || mode === 'card' ? mode : null;
  }

  private getViewModeFromSession(): 'table' | 'card' | null {
    const sessionData = sessionStorage.getItem('commandsTabState');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const mode = parsed.viewMode;
        return mode === 'table' || mode === 'card' ? mode : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getViewModeFromLocal(): 'table' | 'card' | null {
    const localData = localStorage.getItem('userCommandsSettings');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        const mode = parsed.viewMode;
        return mode === 'table' || mode === 'card' ? mode : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getItemsPerPageFromLocal(): number | null {
    const localData = localStorage.getItem('userCommandsSettings');
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        return typeof parsed.itemsPerPage === 'number' ? parsed.itemsPerPage : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private saveViewModeState(mode: 'table' | 'card') {
    // DISABLED: No longer saving to localStorage - will be handled by profile settings
    // localStorage.setItem('userCommandsSettings', JSON.stringify(this.userCommandsSettings));

    // Save to sessionStorage
    this.saveToSession('viewMode', mode);
  }

  private saveToSession(key: string, value: any) {
    const sessionData = sessionStorage.getItem('commandsTabState');
    let data = {};
    if (sessionData) {
      try {
        data = JSON.parse(sessionData);
      } catch {
        data = {};
      }
    }
    data = { ...data, [key]: value };
    sessionStorage.setItem('commandsTabState', JSON.stringify(data));
  }

  private updateURL(mode: 'table' | 'card', page?: number) {
    // Get current query params
    const currentParams = { ...this.route.snapshot.queryParams };

    // Build new query params object
    const newParams: any = {};

    // Always set the view mode
    newParams.view = mode;

    // Only add page parameter if in table mode and page > 1
    if (mode === 'table' && page && page > 1) {
      newParams.page = page;
    }
    // For card mode or page 1, page parameter is omitted (removed)

    // Update URL without triggering navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      replaceUrl: true // Replace current URL to avoid history stack pollution
    });
  }

  private initializePageState(viewMode?: 'table' | 'card') {
    const currentViewMode = viewMode || this.viewMode;

    // Only initialize page state if in table mode
    if (currentViewMode !== 'table') {
      // In card mode, ensure no page parameter in URL
      this.updateURL(currentViewMode);
      return;
    }

    // Priority: URL > sessionStorage > default (1)
    const urlPage = this.getPageFromURL();
    const sessionPage = this.getPageFromSessionForMode(currentViewMode);

    if (urlPage) {
      this.currentPage = urlPage;
    } else if (sessionPage) {
      this.currentPage = sessionPage;
      // Update URL to match session state (only if not page 1)
      if (sessionPage > 1) {
        this.updateURL(currentViewMode, sessionPage);
      }
    } else {
      // No page state found, ensure URL is clean (no page param)
      this.currentPage = 1;
      this.updateURL(currentViewMode, 1);
    }

    // Save current page to sessionStorage
    this.saveToSession('currentPage', this.currentPage);
  }

  private getPageFromURL(): number | null {
    const params = this.route.snapshot.queryParams;
    const page = params['page'];
    const pageNum = parseInt(page, 10);
    return !isNaN(pageNum) && pageNum > 0 ? pageNum : null;
  }

  private getPageFromSession(): number | null {
    // Only return page from session if we're in table mode
    if (this.viewMode !== 'table') {
      return null;
    }

    const sessionData = sessionStorage.getItem('commandsTabState');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const page = parsed.currentPage;
        return typeof page === 'number' && page > 0 ? page : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private getPageFromSessionForMode(viewMode: 'table' | 'card'): number | null {
    // Only return page from session if we're in table mode
    if (viewMode !== 'table') {
      return null;
    }

    const sessionData = sessionStorage.getItem('commandsTabState');
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        const page = parsed.currentPage;
        return typeof page === 'number' && page > 0 ? page : null;
      } catch {
        return null;
      }
    }
    return null;
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

      // Persist page state only in table mode
      if (this.viewMode === 'table') {
        this.saveToSession('currentPage', newPage);
        this.updateURL(this.viewMode, newPage);
      }
    }
  }

  onItemsPerPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
    this.updatePagination();

    // Update items per page (keep localStorage for user preferences)
    this.userCommandsSettings.itemsPerPage = this.itemsPerPage;
    localStorage.setItem('userCommandsSettings', JSON.stringify(this.userCommandsSettings));

    // Update page state only in table mode (back to page 1)
    if (this.viewMode === 'table') {
      this.saveToSession('currentPage', 1);
      this.updateURL(this.viewMode, 1); // This will remove page param since it's 1
    }
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

  startRowEdit(commandId: string) {
    // Cancel any existing edits
    this.cancelEdit();
    this.cancelRowEdit();

    const command = this.commands.find(c => c._id === commandId);
    if (!command) return;

    this.editingRow = commandId;
    this.editingRowValues = {
      ['name']: command.name,
      ['cmd']: command.cmd,
      ['message']: command.message || '',
      ['description']: command.description || '',
      ['cooldown']: command.cooldown,
      ['userLevel']: command.userLevel
    };

    // Focus first input after render
    setTimeout(() => {
      if (this.editingInput) {
        this.editingInput.nativeElement.focus();
      }
    }, 10);
  }

  saveRowEdit() {
    if (!this.editingRow) return;

    const commandId = this.editingRow;
    const newValues = this.editingRowValues;

    // Find the command first to check if it's reserved
    const command = this.commands.find(c => c._id === commandId);
    if (!command) return;

    // Validate required fields (skip message validation for reserved commands)
    const isReserved = command.reserved;
    const messageValid = isReserved || (newValues['message'] && newValues['message'].trim() !== '');

    if (!newValues['name'] || !newValues['cmd'] || !messageValid || newValues['cooldown'] === undefined || newValues['userLevel'] === undefined) {
      this.toastService.error('Invalid Form', 'Please fill in all required fields.');
      return;
    }

    // Update the command, preserving message for reserved commands
    command.name = newValues['name'];
    command.cmd = newValues['cmd'];
    command.message = isReserved ? command.message : (newValues['message'] || '');
    command.description = newValues['description'] || null;
    command.cooldown = newValues['cooldown'];
    command.userLevel = newValues['userLevel'];
    command.userLevelName = this.userLevels[newValues['userLevel'] as keyof typeof this.userLevels];

    this.commandsService.updateCommand(commandId, command).subscribe();

    this.cancelRowEdit();
  }

  cancelRowEdit() {
    this.editingRow = null;
    this.editingRowValues = {};
  }

  startCardEdit(commandId: string) {
    // Check rate limit before allowing edit
    if (!this.checkRateLimit()) {
      return;
    }

    // Cancel any existing edits
    this.cancelEdit();
    this.cancelRowEdit();
    this.cancelCardEdit();

    const command = this.commands.find(c => c._id === commandId);
    if (!command) return;

    this.editingCard = commandId;
    this.editingCardValues = {
      ['name']: command.name,
      ['cmd']: command.cmd,
      ['message']: command.message || '',
      ['description']: command.description || '',
      ['cooldown']: command.cooldown,
      ['userLevel']: command.userLevel
    };

    // Focus first input after render
    setTimeout(() => {
      if (this.editingInput) {
        this.editingInput.nativeElement.focus();
      }
    }, 10);
  }

  saveCardEdit() {
    if (!this.editingCard) return;

    const commandId = this.editingCard;
    const newValues = this.editingCardValues;

    // Find the command first to check if it's reserved
    const command = this.commands.find(c => c._id === commandId);
    if (!command) return;

    // Check rate limit before proceeding
    if (!this.checkRateLimit()) {
      this.cancelCardEdit();
      return;
    }

    // Validate required fields (skip message validation for reserved commands)
    const isReserved = command.reserved;
    const messageValid = isReserved || (newValues['message'] && newValues['message'].trim() !== '');

    if (!newValues['name'] || !newValues['cmd'] || !messageValid || newValues['cooldown'] === undefined || newValues['userLevel'] === undefined) {
      this.toastService.error('Invalid Form', 'Please fill in all required fields.');
      return;
    }

    // Check if any values have actually changed
    const hasNameChanged = command.name !== newValues['name'];
    const hasCmdChanged = command.cmd !== newValues['cmd'];
    const hasMessageChanged = !isReserved && command.message !== (newValues['message'] || '');
    const hasDescriptionChanged = (command.description || '') !== (newValues['description'] || '');
    const hasCooldownChanged = command.cooldown !== newValues['cooldown'];
    const hasUserLevelChanged = command.userLevel !== newValues['userLevel'];

    const hasAnyChange = hasNameChanged || hasCmdChanged || hasMessageChanged ||
                        hasDescriptionChanged || hasCooldownChanged || hasUserLevelChanged;

    // If no changes, just cancel edit without API call
    if (!hasAnyChange) {
      this.cancelCardEdit();
      return;
    }

    // Update the command, preserving message for reserved commands
    command.name = newValues['name'];
    command.cmd = newValues['cmd'];
    command.message = isReserved ? command.message : (newValues['message'] || '');
    command.description = newValues['description'] || null;
    command.cooldown = newValues['cooldown'];
    command.userLevel = newValues['userLevel'];
    command.userLevelName = this.userLevels[newValues['userLevel'] as keyof typeof this.userLevels];

    this.recordRequest();
    this.commandsService.updateCommand(commandId, command).subscribe();

    this.cancelCardEdit();
  }

  cancelCardEdit() {
    this.editingCard = null;
    this.editingCardValues = {};
  }

  isCardEditing(commandId: string): boolean {
    return this.editingCard === commandId;
  }

  getCardEditingValue(field: string): any {
    return this.editingCardValues[field];
  }

  // Rate limiting methods
  public checkRateLimit(): boolean {
    const now = Date.now();

    // If currently rate limited, check if block period is over
    if (this.isRateLimited) {
      if (now >= this.rateLimitEndTime) {
        // Block period is over, reset rate limiting
        this.isRateLimited = false;
        this.requestTimestamps = [];
        this.rateLimitEndTime = 0;
      } else {
        // Still rate limited
        const remainingSeconds = Math.ceil((this.rateLimitEndTime - now) / 1000);
        this.toastService.error('Rate Limited', `You have been rate limited for ${remainingSeconds} seconds. Please wait before making more requests.`);
        return false;
      }
    }

    // Clean old timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
    );

    // Check if we've exceeded the limit
    if (this.requestTimestamps.length >= this.RATE_LIMIT_REQUESTS) {
      this.isRateLimited = true;
      this.rateLimitEndTime = now + this.RATE_LIMIT_BLOCK_DURATION;
      this.toastService.error('Rate Limited', 'You have exceeded the rate limit of 15 requests per minute. You are blocked for 60 seconds.');
      return false;
    }

    return true;
  }

  private recordRequest() {
    this.requestTimestamps.push(Date.now());
  }

  makeEditable(commandId: string, field: string, currentValue: any) {
    // Check rate limit before allowing edit
    if (!this.checkRateLimit()) {
      return;
    }

    // Find the command to check if it's reserved
    const command = this.commands.find(c => c._id === commandId);

    // Prevent editing message field for reserved commands
    if (command?.reserved && field === 'message') {
      this.toastService.error('Cannot Edit', 'The function field cannot be edited for reserved commands.');
      return;
    }

    this.editingCell = { commandId, field };
    this.editingValues[commandId + '_' + field] = currentValue;

    // Focus the input after it's rendered
    setTimeout(() => {
      if (this.editingInput) {
        this.editingInput.nativeElement.focus();
        // Position cursor at the end of the text
        this.editingInput.nativeElement.setSelectionRange(
          this.editingInput.nativeElement.value.length,
          this.editingInput.nativeElement.value.length
        );
      }
    }, 10);
  }

  canEditField(commandId: string, field: string): boolean {
    const command = this.commands.find(c => c._id === commandId);
    // Reserved commands cannot edit the message field
    if (command?.reserved && field === 'message') {
      return false;
    }
    return true;
  }

  saveEdit() {
    if (!this.editingCell) return;

    const { commandId, field } = this.editingCell;
    const newValue = this.editingValues[commandId + '_' + field];

    const command = this.commands.find(c => c._id === commandId);
    if (!command || newValue === undefined) {
      this.cancelEdit();
      return;
    }

    // Check rate limit before proceeding
    if (!this.checkRateLimit()) {
      this.cancelEdit();
      return;
    }

    // Check if the value has actually changed
    let hasChanged = false;
    if (field === 'userLevel') {
      const numericValue = parseInt(newValue);
      hasChanged = command[field] !== numericValue;
    } else {
      hasChanged = command[field] !== newValue;
    }

    // If no change, just cancel edit without API call
    if (!hasChanged) {
      this.cancelEdit();
      return;
    }

    if (field === 'userLevel') {
      const numericValue = parseInt(newValue);
      command[field] = numericValue;
      command.userLevelName = this.userLevels[numericValue as keyof typeof this.userLevels];

      this.recordRequest();
      this.commandsService.updateCommandField(commandId, field, numericValue).subscribe({
        next: () => {
          this.commandsService.updateCommandField(commandId, 'userLevelName',
            this.userLevels[numericValue as keyof typeof this.userLevels]).subscribe({
            next: () => {
            },
            error: (err) => {
              this.toastService.error('Error', err.error?.message || 'Failed to update userLevelName');
              this.refreshCommands();
            }
          });
        },
        error: (err) => {
          this.toastService.error('Error', err.error?.message || 'Failed to update userLevel');
          this.refreshCommands();
        }
      });
    } else {
      command[field] = newValue;
      this.recordRequest();
      this.commandsService.updateCommandField(commandId, field, newValue).subscribe({
        next: () => {
        },
        error: (err) => {
          this.toastService.error('Error', err.error?.message || 'Failed to update command');
          this.refreshCommands();
        }
      });
    }

    this.cancelEdit();
  }

  cancelEdit() {
    this.editingCell = null;
    this.editingValues = {};
  }

  private refreshCommands() {
    if (this.user?.id) {
      this.commandsService.getUserCommands(this.user.id.toString()).subscribe((commands: any) => {
        this.commands = commands;
        this.updatePagination();
      });
    }
  }

  isEditing(commandId: string, field: string): boolean {
    return this.editingCell?.commandId === commandId && this.editingCell?.field === field;
  }

  isRowEditing(commandId: string): boolean {
    return this.editingRow === commandId;
  }

  getEditingValue(commandId: string, field: string): any {
    return this.editingValues[commandId + '_' + field];
  }

  getRowEditingValue(field: string): any {
    return this.editingRowValues[field];
  }

  saveCommand(command: any) {
    if(command.invalid) {
      this.toastService.error('Invalid Form', 'Please fill in all fields.');
      return;
    }

    // Check rate limit before proceeding
    if (!this.checkRateLimit()) {
      this.cancelCardEdit();
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

    this.recordRequest();
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

  public isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

}
