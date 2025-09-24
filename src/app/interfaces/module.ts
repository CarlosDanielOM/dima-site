import { ReleaseStage } from "./releasestage";

export interface Module {
    name: string;
    path: string;
    icon: any;
    description: { en: string; es: string };
    releaseStage: ReleaseStage;
    premium: boolean;
    premium_plus: boolean;
}
