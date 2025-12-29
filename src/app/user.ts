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
    activated?: boolean; // Optional alias for actived
    chat_enabled: boolean;
    up_to_date_twitch_permissions: boolean;
}
