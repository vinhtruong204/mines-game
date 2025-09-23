export var production = false;

export const TOKEN = "465f9913a7d9e915978ba3f1debcf6d9237d92f450214a0d6a61f323791b72a3";

export function getBaseUrl(): string {
    return production ? "https://mngs.nasisoto.org/minigames/" : "api/minigames/";
}

export enum ApiRoute {
    LAST_ACTIVITY = "last-activity",
    BET = "bet",
    PICK = "pick",
    CASHOUT = "cashout",
    RESULT = "result"
}
