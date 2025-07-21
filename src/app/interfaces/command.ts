export interface Command {
    id: string;
    channel: string;
    channelID: string;
    cmd: string;
    cooldown: number;
    count?: number;
    createdAt: string;
    date: {
        day: number;
        month: number;
        year: number;
    };
    description: string;
    enabled: boolean;
    func: string;
    message: string;
    name: string;
    paused: boolean;
    premiumLevelRequired?: number;
    premiumRequired?: boolean;
    reserved: boolean;
    responses?: object[];
    type: string;
    userLevel: number;
    userLevelName: string;
}
