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

export const mockLastActivityResponse: LastActivityApiResponse = {
    data: {
        username: "vinh_player",
        balance: 1000123,
        currency: "IDR",
        last_activity: {
            pick: 2,
            field: [0, 1, 2, 3, 4],
            bomb_field: [1, 3],
            amount: 100,
            multiplier: 1.5,
            bomb_count: 2,
            total_win: 150,
            is_settle: true,
            end_round: true,
        },
        last_bet: 100,
    }
};
