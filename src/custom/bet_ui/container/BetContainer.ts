import { Container } from "pixi.js";
import { LabeledInput } from "../base/LabeledInput";
import { InputBetAmount } from "../bet_amount/InputBetAmount";
import { SelectMines } from "../mines_ui/SelectMines";

type BetState = {
    betAmount: string;
};

export class BetContainer extends Container {
    protected betAmount: LabeledInput;
    protected selectMines: SelectMines;

    constructor(x: number, y: number) {
        super({ x: x, y: y });

        this.betAmount = new LabeledInput(0, 0, 200, 100, "Amount", "00.0$",
            new InputBetAmount()
        );

        this.selectMines = new SelectMines(this.betAmount.x, this.betAmount.y + this.betAmount.height);

        this.addChild(this.betAmount, this.selectMines);
    }

    public getBetState(): BetState {
        return {
            betAmount: this.betAmount.getInputAmount().value
        };
    }

    public setBetState(betState: BetState) {
        this.betAmount.getInputAmount().value = betState.betAmount;
    }

}