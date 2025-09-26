export interface CashoutResponseData {
    pick: number;
    field: number[];
    bomb_field: number[];
    amount: number;
    multiplier: number;
    bomb_count: number;
    total_win: number;
    end_round: boolean;
}

export interface CashoutApiResponse {
    data: CashoutResponseData;
    error?: string;
}

export const mockCashoutResponse = {
    data: {
        pick: 3,
        field: [3, 7, 9],
        bomb_field: [15, 2, 5, 19, 22],
        amount: 1000,
        multiplier: 2.43,
        bomb_count: 5,
        total_win: 2430,
        end_round: true
    }
}