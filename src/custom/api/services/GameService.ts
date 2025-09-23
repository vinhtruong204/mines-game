import { ApiRoute, getBaseUrl, TOKEN } from "../ApiRoute";
import { ApiClient } from "../ApiClient";
import { IApiClient } from "../IApiClient";
import { LastActivityApiResponse } from "../models/LastActivityResponse";
import { BetApiResponse } from "../models/BetResponse";
import { PickApiResponse } from "../models/PickResponse";
import { CashoutApiResponse } from "../models/CashoutResponse";

export class GameService {
    constructor(private api: IApiClient) { }

    public getLastActivity(): Promise<LastActivityApiResponse> {
        return this.api.get<LastActivityApiResponse>(
            `${ApiRoute.LAST_ACTIVITY}`,
            { token: TOKEN }
        );
    }

    public postBet(amount: number, bomb_count: number): Promise<BetApiResponse> {
        return this.api.post<BetApiResponse>(
            `${ApiRoute.BET}`,
            { token: TOKEN, amount: amount, bomb_count: bomb_count }
        );
    }

    public postPick(pick_index: number[]): Promise<PickApiResponse> {
        return this.api.post<PickApiResponse>(
            `${ApiRoute.PICK}`,
            { token: TOKEN, pick_index: pick_index }
        );
    }

    public cashout(): Promise<CashoutApiResponse> {
        return this.api.post<CashoutApiResponse>(
            `${ApiRoute.CASHOUT}`,
            { token: TOKEN }
        );
    }

    public postResult(): Promise<CashoutApiResponse> {
        return this.api.post<CashoutApiResponse>(
            `${ApiRoute.RESULT}`,
            { token: TOKEN }
        );
    }
}

const apiClient = new ApiClient(getBaseUrl(), TOKEN);

export const gameService = new GameService(apiClient);
