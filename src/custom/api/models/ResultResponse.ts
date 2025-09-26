export interface ResultResponseData {
    username: string;
    balance: number;
    currency: string;
    bonus_event?: object;
}

export interface ResultApiResponse {
    data: ResultResponseData;
    error?: string;
}

export const mockResultResponse: ResultApiResponse = {
    data: {
        username: "vinh_player",
        balance: 1000123,
        currency: "IDR",
        bonus_event: undefined
    }
}