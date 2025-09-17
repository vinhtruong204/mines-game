import { ItemType } from "../_game/board/ItemType";
import { GlobalConfig } from "../config/GlobalConfig";

export class GetItem {
  private static mockData: number[][] = [
    [0, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1],
  ];

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

    const matrix: number[][] = [];
    for (let r = 0; r < rows; r++) {
      matrix.push(flat.slice(r * cols, (r + 1) * cols));
    }

    this.mockData = matrix;
  }

  public static async getItemType(i: number, j: number): Promise<ItemType> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.mockData[i][j]);
      }, 0);
    });
  }
}
