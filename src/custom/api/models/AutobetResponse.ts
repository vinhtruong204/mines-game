export interface AutoBetResponseData {
  username: string;
  balance: number;
  currency: string;
  pick: number;
  field: number[];
  bomb_field: number[];
  amount: number;
  multiplier: number;
  bomb_count: number;
  total_win: number;
  end_round: boolean;
}

// Response chung cho API bet
export interface AutoBetApiResponse {
  data: AutoBetResponseData;
  error?: string;
}

export const mockAutoBetResponse: AutoBetApiResponse = {
  data: {
    username: "vinh_player",
    balance: 1000123,
    currency: "IDR",
    pick: 3,
    field: [6, 9, 16],
    bomb_field: [5, 12, 4, 2, 23],
    amount: 1000,
    multiplier: 2.65,
    bomb_count: 5,
    total_win: 2650,
    end_round: true
  }
}