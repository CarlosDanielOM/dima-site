export interface User {
    id: number;
    login: string;
    display_name: string;
    token: string;
    email: string;
    profile_image_url: string;
    premium: boolean;
    premium_until: string;
    premium_plus: boolean;
    actived: boolean;
    chat_enabled: boolean;
}
