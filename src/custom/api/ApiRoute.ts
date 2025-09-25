export var useMock = false;
export var TOKEN = "";

export function getToken(): { useMock: boolean; token: string } {
    const urlParams = Object.fromEntries(new URLSearchParams(window.location.search));
    let temp: boolean;
    // console.log(urlParams);

    if (urlParams?.useMock == "true") {
        temp = true;
    } else {
        temp = false;
        TOKEN = urlParams?.token;
    }

    useMock = temp;
    return { useMock: temp, token: urlParams?.token };
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
