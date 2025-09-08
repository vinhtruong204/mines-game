import { Graphics } from "pixi.js";
import { CustomInputBase } from "../base/CustomInputBase";
import { TriangleType } from "../base/TriangleSprite";
import { FancyButton } from "@pixi/ui";
import { globalEmitter } from "../../events/GlobalEmitter";
import { GameStateEvent } from "../../events/game_states/GameStateEvent";
import { GameState } from "../../manage_game_states/GameState";

const defaultInputFieldSize = {
    width: 500,
    height: 50
}

const defaultButtonSize = {
    width: 50,
    height: 50
}

export class InputBetAmount extends CustomInputBase {
    private betCofig: number[];
    private currentIndex: number = 0;

    // 2 buttons
    private halfButton: FancyButton;
    private doubleButton: FancyButton;
    constructor() {
        const inputGraphics = new Graphics()
            .rect(0, 0, defaultInputFieldSize.width - defaultButtonSize.width * 2, defaultInputFieldSize.height)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, color: 'gray', alpha: 1, alignment: 0.5 });

        super(inputGraphics, "0000.00");

        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));

        // Initial bet config and update value
        this.betCofig = [200, 400, 600, 800, 1000, 2000, 5000, 7500, 10000];
        this.updateValue(this.betCofig[this.currentIndex]);

        // Initial buttons
        this.halfButton = new FancyButton({
            defaultView: this.getButtonDefaultView(),
            text: '1/2'
        });

        this.doubleButton = new FancyButton({
            defaultView: this.getButtonDefaultView(),
            text: '2x'
        });

        // Adjust position of the buttons
        this.doubleButton.position.set(defaultInputFieldSize.width - defaultButtonSize.width, 0);
        this.halfButton.position.set(this.doubleButton.x - defaultButtonSize.width, 0);

        this.addChild(this.halfButton, this.doubleButton);

        // Handle request change value event
        this.onRequestValueChange = this.onValueChange.bind(this);

        // Handle buttons event
        this.halfButton.onpointerdown = this.handleHalfButtonClicked.bind(this);
        this.doubleButton.onpointerdown = this.handleDoubleButtonClicked.bind(this);
    }

    private handleHalfButtonClicked() {
        let currentValue = Number(this.value);
        this.updateValue(currentValue / 2);
    }

    private handleDoubleButtonClicked() {
        let currentValue = Number(this.value);
        this.updateValue(currentValue * 2);
    }

    private onValueChange(triangleType: TriangleType) {
        if (triangleType === TriangleType.UP)
            this.currentIndex = this.currentIndex + 1 >= this.betCofig.length
                ? this.betCofig.length - 1
                : ++this.currentIndex;
        else
            this.currentIndex = this.currentIndex - 1 < 0 ? 0 : --this.currentIndex;
        this.updateValue(this.betCofig[this.currentIndex]);
    }

    private updateValue(newValue: number) {
        this.value = String(newValue.toFixed(2));
    }

    private getButtonDefaultView(): Graphics {
        return new Graphics()
            .rect(0, 0, defaultButtonSize.width, defaultButtonSize.height)
            .fill('white')
            .stroke({ width: 4, color: 'gray', alignment: 0.5 });
    }

    public getBetConfig() {
        return this.betCofig;
    }

    private onGameStateChange(state: GameState) {
        if (state === GameState.BETTING) {
            this.interactive = false;
            this.interactiveChildren = false;
        } else {
            this.interactive = true;
            this.interactiveChildren = true;
        }
    }
}