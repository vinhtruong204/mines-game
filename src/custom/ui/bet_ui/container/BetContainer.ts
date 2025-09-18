import { Container } from "pixi.js";
import { LabeledInput } from "../base/LabeledInput";
import { InputBetAmount } from "../bet_amount/InputBetAmount";
import { SelectModeManager as SelectModeGroup } from "./manual_bet/SelectModeManager";
import { GameMode } from "../mines_ui/GameMode";

type BetState = {
    betAmount: string;
    gameMode: GameMode;
};

export class BetContainer extends Container {
    protected betAmount: LabeledInput;
    protected selectModeGroup: SelectModeGroup;
    public gameModeChange?: (gameMode: GameMode) => void;

    constructor(x: number, y: number) {
        super({ x: x, y: y });

        this.betAmount = new LabeledInput(0, 0, 200, 100, "Amount", "00.0$",
            new InputBetAmount()
        );


        // Select mode group
        this.selectModeGroup = new SelectModeGroup();
        this.selectModeGroup.position.set(this.betAmount.x, this.betAmount.y + this.betAmount.height);
        this.selectModeGroup.gameModeChange = this.onGameModeChange.bind(this);

        this.addChild(this.betAmount, this.selectModeGroup);
    }

    private onGameModeChange(gameMode: GameMode) {
        this.gameModeChange?.(gameMode);
    }

    public getBetState(): BetState {
        return {
            betAmount: this.betAmount.getInputAmount().value,
            gameMode: this.selectModeGroup.getCurrentMode(),
        };
    }

    public setBetState(betState: BetState) {
        this.betAmount.getInputAmount().value = betState.betAmount;
        this.selectModeGroup.setCurrentMode(betState.gameMode);
    }

}