import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';
import { map } from 'rxjs/operators';
import { Command } from '../interfaces/command';

@Injectable({
  providedIn: 'root'
})
export class CommandsService {

  private headers: HttpHeaders | null = null;
  
  constructor(
    private http: HttpClient,
    private userService: UserService
  ) {
    this.headers = new HttpHeaders().set('Authorization', `${this.userService.getToken()}`);
  }

  getUserCommands(userId: string) {
    return this.http.get<Command[]>(`${environment.DIMA_API}/commands/${userId}`, { headers: this.headers as any })
    .pipe(
      map((res: any) => {
        return res.commands;
      })
    );
  }
}
