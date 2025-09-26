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

export const mockBetResponse: BetApiResponse = {
    data: {
        username: "vinh_player",
        balance: 1000123,
        currency: "IDR",
        end_round: false
    }
}