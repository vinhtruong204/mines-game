import { Graphics } from "pixi.js";
import { CustomInputBase } from "../../base/CustomInputBase";
import { LabeledInput } from "../../base/LabeledInput";
import { Button } from "../../../../../app/ui/Button";
import { GameStateEvent } from "../../../../events/game_states/GameStateEvent";
import { globalEmitter } from "../../../../events/GlobalEmitter";
import { GameState } from "../../../../manage_game_states/GameState";
import { TriangleType } from "../../base/TriangleSprite";

const defaultInputFieldSize = {
    width: 530,
    height: 90
}

const defaultButtonSize = {
    width: 160,
    height: 100
}

const MAX_VALUE = 100;
const MIN_VALUE = 0;

//**Custom input percent for autoplay */
export class CustomLabelInput extends LabeledInput {
    private resetButton: Button;
    private increaseButton: Button;

    constructor(x: number, y: number, leftLabel: string, rightLabel: string) {
        const inputFieldGraphics = new Graphics()
            .rect(0, 0, defaultInputFieldSize.width - (defaultButtonSize.width * 2), defaultInputFieldSize.height)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, color: 'gray', alpha: 1, alignment: 0.5 });

        super(x, y, defaultInputFieldSize.width, defaultInputFieldSize.height, leftLabel, rightLabel, new CustomInputBase(inputFieldGraphics, ''));

        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStatesChange.bind(this));

        // Reset button
        this.resetButton = new Button({
            text: 'Reset',
            width: defaultButtonSize.width,
            height: defaultButtonSize.height,
            fontSize: 40,
        });
        this.resetButton.position.set(this.leftLabel.x, this.leftLabel.y + this.leftLabel.height);
        this.resetButton.onPress.connect(this.onResetClicked.bind(this));

        // Increase button
        this.increaseButton = new Button({
            text: 'Increase',
            width: defaultButtonSize.width,
            height: defaultButtonSize.height,
            fontSize: 40,
        });
        this.increaseButton.position.set(this.resetButton.x + this.resetButton.width, this.leftLabel.y + this.leftLabel.height);
        this.increaseButton.alpha = 0.5;
        this.increaseButton.onPress.connect(this.onIncreaseClicked.bind(this));

        // Resize input field
        this.inputAmount.position.set(this.increaseButton.x + this.increaseButton.width, this.resetButton.y);
        this.updateInputValue('0');


        // Disable interact with input when start the game
        this.updateInputInteractive(false);

        // Handle event when request value change
        this.inputAmount.onRequestValueChange = this.onRequestValueChange.bind(this);
        this.inputAmount.onTypeRequestValueChange = this.onTypeRequestValueChange.bind(this);

        this.addChild(this.resetButton, this.increaseButton);
    }

    private updateInputValue(value: string) {
        this.inputAmount.value = value;
    }

    private onIncreaseClicked() {
        this.updateInputInteractive(true);
    }

    private onResetClicked() {
        this.updateInputInteractive(false);
        this.updateInputValue('0');
    }

    private updateInputInteractive(value: boolean) {
        this.inputAmount.interactive = value;

        // Update button UI
        this.increaseButton.alpha = value ? 1 : 0.5;
        this.resetButton.alpha = value ? 0.5 : 1;

        // Update input field alpha
        this.inputAmount.alpha = value ? 1 : 0.5;
    }

    private onRequestValueChange(triangleType: TriangleType) {
        let currValue = Number(this.inputAmount.value);
        if (triangleType === TriangleType.UP) {
            this.inputAmount.value = String(currValue + 1 > MAX_VALUE ? MAX_VALUE : ++currValue);
        }
        else {
            this.inputAmount.value = String(currValue - 1 < MIN_VALUE ? MIN_VALUE : --currValue);
        }
    }

    private onTypeRequestValueChange(value: string) {
        let currValue = Number(value);
        this.inputAmount.value = String(Math.max(MIN_VALUE, Math.min(currValue, MAX_VALUE)));
    }

    private onGameStatesChange(state: GameState) {
        if (state === GameState.BETTING) {
            this.interactive = false;
            this.interactiveChildren = false;
        } else if (state === GameState.NOT_BETTING) {
            this.interactive = true;
            this.interactiveChildren = true;
        }
    }

    public getCurrentPercent(): number {
        return Number(this.inputAmount.value);
    }
}