import { ItemType } from "../_game/board/ItemType";
import { GlobalConfig } from "../config/GlobalConfig";

export class GetItem {
  private static mockData: number[] = [
    0, 1, 1, 1, 1,
    1, 1, 1, 1, 1,
    1, 0, 1, 0, 1,
    1, 1, 0, 1, 1,
    0, 1, 1, 1, 1,
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

    this.mockData = flat;
  }

  public static getItemType(index: number): ItemType {
    if (index < 0 || index >= this.mockData.length) {
      console.error(`Invalid index ${index}, mockData length = ${this.mockData.length}`);
      return ItemType.BOMB; 
    }
    return this.mockData[index] as ItemType;
  }

}
