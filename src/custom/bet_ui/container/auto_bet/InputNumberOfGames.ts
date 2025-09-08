import { Graphics } from "pixi.js";
import { CustomInputBase } from "../../base/CustomInputBase";
import { TriangleType } from "../../base/TriangleSprite";
import { globalEmitter } from "../../../events/GlobalEmitter";
import { GameStateEvent } from "../../../events/game_states/GameStateEvent";
import { GameState } from "../../../manage_game_states/GameState";

const MAX_NUMBER_OF_GAMES = 999999999;

const defaultInputFieldSize = {
    width: 500,
    height: 50
}

export class InputNumberOfGames extends CustomInputBase {

    constructor() {
        const inputFieldGraphics = new Graphics()
            .rect(0, 0, defaultInputFieldSize.width, defaultInputFieldSize.height)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, color: 'gray', alpha: 1, alignment: 0.5 });
        super(inputFieldGraphics, '0');

        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));

        // Handle value change event
        this.onRequestValueChange = this.onValueChange.bind(this);
    }

    private onValueChange(triangleType: TriangleType) {
        let currentValue = Number(this.value);

        if (triangleType === TriangleType.DOWN)
            this.value = String(currentValue - 1 < 0 ? 0 : --currentValue);
        else
            this.value = String(currentValue + 1 > MAX_NUMBER_OF_GAMES ? MAX_NUMBER_OF_GAMES : ++currentValue);
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