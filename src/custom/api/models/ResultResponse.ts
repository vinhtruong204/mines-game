export interface ResultResponseData {
    username: string;
    balance: number;
    currency: string;
    bonus_event: object;
}

export interface ResultApiResponse {
    data: ResultResponseData;
    error?: string;
}