export var useMock = true;
export var TOKEN = "";

export function getToken(): string {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
    console.log(urlParams);

    if (urlParams?.useMock == "true") {
        useMock = true;
    } else {
        useMock = false;

        TOKEN = urlParams?.token;
    }

    return TOKEN;
}

export function getBaseUrl(): string {
    return "https://mngs.nasisoto.org/games/minigames/";
}

export enum ApiRoute {
    LAST_ACTIVITY = "last-activity",
    BET = "bet",
    PICK = "pick",
    CASHOUT = "cashout",
    RESULT = "result"
}
