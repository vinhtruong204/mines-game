import { ApiRoute, getBaseUrl, getToken, TOKEN, useMock } from "../ApiRoute";
import { ApiClient } from "../ApiClient";
import { IApiClient } from "../IApiClient";
import { LastActivityApiResponse, mockLastActivityResponse } from "../models/LastActivityResponse";
import { BetApiResponse, mockBetResponse } from "../models/BetResponse";
import { mockPickApiResponse, PickApiResponse } from "../models/PickResponse";
import { CashoutApiResponse, mockCashoutResponse } from "../models/CashoutResponse";
import { mockResultResponse, ResultApiResponse } from "../models/ResultResponse";
import { AutoBetApiResponse, mockAutoBetResponse } from "../models/AutobetResponse";

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
        return Promise.resolve(mockLastActivityResponse);
    }
    public postBet(amount: number, bomb_count: number): Promise<BetApiResponse> {
        if (!useMock) {
            return this.api.post<BetApiResponse>(
                `${ApiRoute.BET}`,
                { token: TOKEN, amount: amount, bomb_count: bomb_count }
            );
        }
        // Provide a mock response or rejected promise if needed
        return Promise.resolve(mockBetResponse);
    }

    public postAutoBet(amount: number, bomb_count: number, pick_index: number[]): Promise<AutoBetApiResponse> {
        if (!useMock) {
            return this.api.post<AutoBetApiResponse>(
                `${ApiRoute.BET}`,
                { token: TOKEN, amount: amount, bomb_count: bomb_count, pick_index: pick_index }
            );
        }
        return Promise.resolve(mockAutoBetResponse);
    }

    public postPick(pick_index: number[]): Promise<PickApiResponse> {
        if (!useMock) {
            return this.api.post<PickApiResponse>(
                `${ApiRoute.PICK}`,
                { token: TOKEN, pick_index: pick_index }
            );
        }
        return Promise.resolve(mockPickApiResponse);
    }

    public postCashout(): Promise<CashoutApiResponse> {
        if (!useMock) {
            return this.api.post<CashoutApiResponse>(
                `${ApiRoute.CASHOUT}`,
                { token: TOKEN }
            );
        }
        return Promise.resolve(mockCashoutResponse);
    }

    public postResult(): Promise<ResultApiResponse> {
        if (!useMock) {
            return this.api.post<ResultApiResponse>(
                `${ApiRoute.RESULT}`,
                { token: TOKEN }
            );
        }
        return Promise.resolve(mockResultResponse);
    }
}

const apiClient = new ApiClient(getBaseUrl(), getToken().token);

export const gameService = new GameService(apiClient);

