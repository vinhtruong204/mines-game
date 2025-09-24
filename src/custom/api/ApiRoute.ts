export var production = false;

export const TOKEN = "058b1e419669260969c971720e7830a3b03e04d1b39b1e816f5188dfa4efd24e";

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
