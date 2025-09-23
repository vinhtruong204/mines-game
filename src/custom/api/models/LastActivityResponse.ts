export interface LastActivity {
    pick: number;
    field: number[];
    bomb_field: number[];
    amount: number;
    multiplier: number;
    bomb_count: number;
    total_win: number;
    is_settle: boolean;
    end_round: boolean;
}

export interface LastActivityResponseData {
    username: string;
    balance: number;
    currency: string;
    last_activity: LastActivity;
    last_bet: number;
}

export interface LastActivityApiResponse {
    data: LastActivityResponseData;
    error?: string;
}