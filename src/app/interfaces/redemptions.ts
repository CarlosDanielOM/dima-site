export interface Redemptions {
    eventsubID: string,
    channelID: string,
    channel: string,
    rewardID?: string,
    id?: string,
    title: string,
    type: string,
    prompt: string,
    originalCost: number,
    cost: number,
    isEnabled: boolean,
    message: string,
    costChange: number,
    returnToOriginalCost: boolean,
    duration: number,
    cooldown: number,
    background_color?: string
}
