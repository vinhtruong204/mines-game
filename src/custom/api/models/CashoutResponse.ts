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