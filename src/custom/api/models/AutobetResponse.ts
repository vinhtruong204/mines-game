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
  error: string;
}
