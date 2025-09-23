export var production = false;

export const TOKEN = "9850b8d77d079689b6c2bb4b5132f7a2809d0b8192884ade0b77b6a2ad76a2d4";

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
