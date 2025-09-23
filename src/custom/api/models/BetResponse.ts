export interface BetResponseData {
    username: string;
    balance: number;
    currency: string;
    end_round: boolean;
}

export interface BetApiResponse {
    data: BetResponseData;
    error?: string;
}