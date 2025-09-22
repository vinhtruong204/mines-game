export var production = false;

export const TOKEN = "50bea005046c2df0a8c3d3ae095b18a062ce61dce0ba877a898b5bd634f3c847"

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
