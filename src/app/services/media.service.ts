import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { MediaFile } from '../interfaces/triggers';
import { environment } from '../../environments/environment';
import { UserService } from '../user.service';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private readonly CACHE_TTL = 300_000; // 5 minutes

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cache: CacheService
  ) { }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `${this.userService.getToken()}`);
  }

  getMediaFiles(forceRefresh = false): Observable<MediaFile[]> {
    const userId = this.userService.getUserId();
    const cacheKey = `media:${userId}`;

    return this.cache.getOrSet<MediaFile[]>(
      cacheKey,
      this.CACHE_TTL,
      () => this.http.get<any>(`${environment.DIMA_API}/triggers/files/${userId}`, { headers: this.getHeaders() })
        .pipe(
          map(response => {
            return (response.data || []).map((item: any) => this.mapApiToMediaFile(item));
          })
        ),
      forceRefresh
    );
  }

  uploadMedia(file: File, name: string): Observable<MediaFile> {
    const userId = this.userService.getUserId();
    const formData = new FormData();
    formData.append('trigger', file);
    formData.append('triggerName', name);

    // Note: Content-Type header for FormData should typically be left to the browser to set (with boundary)
    // So we don't set it manually in getHeaders(), but we need Authorization.
    const headers = new HttpHeaders().set('Authorization', `${this.userService.getToken()}`);

    return this.http.post<any>(`${environment.DIMA_API}/triggers/${userId}/upload`, formData, { headers })
      .pipe(
        map(response => {
          const newFile = this.mapApiToMediaFile(response.data);
          this.cache.clear(`media:${userId}`);
          return newFile;
        }),
        catchError(err => {
          console.error('Upload media error', err);
          return throwError(() => err);
        })
      );
  }

  deleteMedia(id: string): Observable<void> {
    const userId = this.userService.getUserId();
    return this.http.delete<any>(`${environment.DIMA_API}/triggers/files/${userId}/${id}`, { headers: this.getHeaders() })
      .pipe(
        map(() => {
          this.cache.clear(`media:${userId}`);
          return void 0;
        })
      );
  }

  private mapApiToMediaFile(data: any): MediaFile {
    let type = 'unknown';
    if (data.fileType) {
        if (data.fileType.startsWith('video')) type = 'video';
        else if (data.fileType.startsWith('image')) type = 'image';
        else if (data.fileType.startsWith('audio')) type = 'audio';
    }

    return {
      id: data._id,
      name: data.name,
      fileName: data.fileName,
      type: type, // mapped type for UI
      mimeType: data.fileType, // Original MIME type
      size: data.fileSize,
      url: data.fileUrl,
      uploadedAt: new Date().toISOString(), // API doesn't seem to return date, fallback
      previewUrl: data.fileUrl // Alias for UI
    };
  }
}
