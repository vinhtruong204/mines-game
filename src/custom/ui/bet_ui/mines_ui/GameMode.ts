export enum GameMode {
    EASY = 0,
    MEDIUM = 1,
    HARD = 2,
    EXTREME = 3,
}

export const GameModeLabel: Record<GameMode, string> = {
    [GameMode.EASY]: "Easy",
    [GameMode.MEDIUM]: "Medium",
    [GameMode.HARD]: "Hard",
    [GameMode.EXTREME]: "Extreme",
};