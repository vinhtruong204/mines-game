import { ItemType } from "../_game/board/ItemType";
import { GlobalConfig } from "../config/GlobalConfig";
import { ApiRoute, getBaseUrl, TOKEN } from "./ApiRoute";

export class ApiClient {
  private static mockData: number[] = [
    0, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    1, 0, 1, 0, 1,
    1, 1, 0, 1, 1,
    0, 1, 1, 1, 1,
  ];

  private baseUrl: string;

  constructor() {
    this.baseUrl = getBaseUrl();
  }

  public async fetchData(): Promise<any> {
    try {
      // const requestUrl = `${BASE_URL + ApiRoute.LAST_ACTIVITY}?token=${TOKEN}`;
      const requestUrl = `${this.baseUrl + ApiRoute.LAST_ACTIVITY}?token=${TOKEN}`;

      const response = await fetch(requestUrl, { method: 'GET' });
      // {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   // body: JSON.stringify({ token: TOKEN })
      // }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  public async bet(amount: number, bomb_count: number) {
    try {
      // const requestUrl = `${BASE_URL + ApiRoute.LAST_ACTIVITY}?token=${TOKEN}`;
      const betUrl = `${this.baseUrl + ApiRoute.BET}`;

      const response = await fetch(betUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: TOKEN,
            amount: amount,
            bomb_count: bomb_count
          })
        }
      );


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  public static generateMatrix(mines: number) {
    const rows = GlobalConfig.TOTAL_ROWS;
    const cols = GlobalConfig.TOTAL_COLUMNS;
    const totalCells = rows * cols;

    if (mines >= totalCells) {
      throw new Error("Too many mines! More than available cells.");
    }

    const flat: number[] = Array(totalCells).fill(1);

    let placed = 0;
    while (placed < mines) {
      const randIndex = Math.floor(Math.random() * totalCells);
      if (flat[randIndex] === 1) {
        flat[randIndex] = 0;
        placed++;
      }
    }

    this.mockData = flat;
  }

  public static getItemType(index: number): ItemType {
    // if (index < 0 || index >= this.mockData.length) {
    //   console.error(`Invalid index ${index}, mockData length = ${this.mockData.length}`);
    //   return ItemType.BOMB; 
    // }

    return this.mockData[index] as ItemType;
  }

}

export const apiClient = new ApiClient();