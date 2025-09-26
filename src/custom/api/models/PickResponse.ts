export interface PickResponseData {
    pick: number;
    field: number[];
    bomb_field?: number[];
    amount: number;
    multiplier: number;
    bomb_count: number;
    total_win: number;
    end_round: boolean;
}

export interface PickApiResponse {
    data: PickResponseData;
    error?: string;
}

export const mockPickApiResponse: PickApiResponse = {
    data: {
        pick: 1,
        field: [3],
        bomb_field: undefined, // [2, 3, 5, 22, 1],
        amount: 1000,
        multiplier: 2.31,
        bomb_count: 5,
        total_win: 2310,
        end_round: false
    }
}