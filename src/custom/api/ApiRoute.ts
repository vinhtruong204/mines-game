export var production = true;

export const TOKEN = "543e103f2f13c59ac14a46b599eee10f9a1dd0773ee955aa3a1e963d7534aa01";

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
