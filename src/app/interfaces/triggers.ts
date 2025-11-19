import { Redemptions } from './redemptions';

export interface Trigger extends Redemptions {
    _id?: string; // Internal MongoDB ID
    mediaName?: string; // 'file' from API
    mediaType?: string; // MIME type
    fileID?: string;
    volume?: number;
}

export interface MediaFile {
    id: string; // _id from API
    name: string;
    fileName: string;
    type: string; // 'video', 'image', 'audio' for UI logic
    mimeType: string; // Original MIME type (e.g. 'video/mp4')
    size: number;
    url: string; // 'fileUrl' from API
    uploadedAt?: string;
    previewUrl: string;
}
