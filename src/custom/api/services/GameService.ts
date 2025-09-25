import { ApiRoute, getBaseUrl, getToken, TOKEN, useMock } from "../ApiRoute";
import { ApiClient } from "../ApiClient";
import { IApiClient } from "../IApiClient";
import { LastActivityApiResponse, mockLastActivity } from "../models/LastActivityResponse";
import { BetApiResponse } from "../models/BetResponse";
import { PickApiResponse } from "../models/PickResponse";
import { CashoutApiResponse } from "../models/CashoutResponse";
import { ResultApiResponse } from "../models/ResultResponse";
import { AutoBetApiResponse } from "../models/AutobetResponse";

export class GameService {
    constructor(private api: IApiClient) { }

    public getLastActivity(): Promise<LastActivityApiResponse> {

        if (!useMock) {
            return this.api.get<LastActivityApiResponse>(
                `${ApiRoute.LAST_ACTIVITY}`,
                { token: TOKEN }
            );
        }

        // If useMock is true, throw or return a rejected promise to satisfy return type
        return Promise.resolve(mockLastActivity);
    }

    public postBet(amount: number, bomb_count: number): Promise<BetApiResponse> {
        return this.api.post<BetApiResponse>(
            `${ApiRoute.BET}`,
            { token: TOKEN, amount: amount, bomb_count: bomb_count }
        );
    }

    public postAutoBet(amount: number, bomb_count: number, pick_index: number[]): Promise<AutoBetApiResponse> {
        return this.api.post<AutoBetApiResponse>(
            `${ApiRoute.BET}`,
            { token: TOKEN, amount: amount, bomb_count: bomb_count, pick_index: pick_index}
        );
    }

    public postPick(pick_index: number[]): Promise<PickApiResponse> {
        return this.api.post<PickApiResponse>(
            `${ApiRoute.PICK}`,
            { token: TOKEN, pick_index: pick_index }
        );
    }

    public postCashout(): Promise<CashoutApiResponse> {
        return this.api.post<CashoutApiResponse>(
            `${ApiRoute.CASHOUT}`,
            { token: TOKEN }
        );
    }

    public postResult(): Promise<ResultApiResponse> {
        return this.api.post<ResultApiResponse>(
            `${ApiRoute.RESULT}`,
            { token: TOKEN }
        );
    }
}

const apiClient = new ApiClient(getBaseUrl(), getToken().token);

export const gameService = new GameService(apiClient);

