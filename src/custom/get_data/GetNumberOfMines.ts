import { GameMode } from "../ui/bet_ui/mines_ui/GameMode";

export class GetNumberOfMines {
    public static getNumberOfMines(gameMode: GameMode): number {
        switch (gameMode) {
            case GameMode.EASY:
                return 5;
            case GameMode.MEDIUM:
                return 10;
            case GameMode.HARD:
                return 15;
            case GameMode.EXTREME:
                return 24;
            default:
                return 0;
        }
    }
}