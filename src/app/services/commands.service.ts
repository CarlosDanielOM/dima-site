import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';
import { catchError, map } from 'rxjs/operators';
import { Command } from '../interfaces/command';
import { throwError } from 'rxjs';
import { ToastService } from '../toast.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  private headers: HttpHeaders | null = null;

  private readonly COMMANDS_TTL_MS = 1000 * 60 * 5; // 5 minutes

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private toastService: ToastService,
    private cacheService: CacheService
  ) {
    this.headers = new HttpHeaders().set('Authorization', `${this.userService.getToken()}`);
  }

  getUserCommands(userId: string) {
    const cacheKey = `commands:${userId}`;
    return this.cacheService.getOrSet(cacheKey, this.COMMANDS_TTL_MS, () => this.http.get<Command[]>(`${environment.DIMA_API}/commands/${userId}`, { headers: this.headers as any })
    .pipe(
      map((res: any) => {
        return res.commands;
      })
    ));
  }

  createCommand(command: Command) {
    return this.http.post(`${environment.DIMA_API}/commands/${this.userService.getUserId()}`, command, { headers: this.headers as any }).pipe(
      map((res: any) => {
        this.toastService.success('Command Created', 'The command has been created.');
        return res.command;
      }),
      catchError((err: any) => {
        this.toastService.error('Error', err.error.message);
        return throwError(() => err);
      })
    )
  }

  updateCommandField(commandID: string, field: string, value: any) {
    return this.http.put(`${environment.DIMA_API}/commands/${this.userService.getUserId()}/${commandID}`, { [field]: value }, { headers: this.headers as any })
    .pipe(
      map((res: any) => {
        this.toastService.success('Saved', `${field} updated successfully`);
        return res.command;
      }),
      catchError((err: any) => {
        this.toastService.error('Error', err.error.message);
        return throwError(() => err);
      })
    );
  }

  updateCommand(commandID: string, command: Command) {
    return this.http.put(`${environment.DIMA_API}/commands/${this.userService.getUserId()}/${commandID}`, command, { headers: this.headers as any })
    .pipe(
      map((res: any) => {
        this.toastService.success('Saved', 'Command updated successfully');
        return res.command;
      }),
      catchError((err: any) => {
        this.toastService.error('Error', err.error.message);
        return throwError(() => err);
      })
    );
  }

  deleteCommand(commandId: string) {
    return this.http.delete(`${environment.DIMA_API}/commands/${this.userService.getUserId()}/${commandId}`, { headers: this.headers as any })
    .pipe(
      map((res: any) => {
        return res;
      })
    );
  }
  
}
