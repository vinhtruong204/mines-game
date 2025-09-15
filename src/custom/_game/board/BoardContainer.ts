import { Container, Sprite, Ticker } from "pixi.js";
import { Button } from "../../../app/ui/Button";
import { ItemType } from "./ItemType";
import { GetItem } from "../../get_data/GetItem";
import { globalEmitter } from "../../events/GlobalEmitter";
import { GameStateEvent } from "../../events/game_states/GameStateEvent";
import { ManualBettingEvent } from "../../events/manual_betting_events/ManualBettingEvent";
import { GameModeChangeEvent } from "../../events/game_mode_events/GameModeChangeEvent";
import { PhaseAuto } from "./PhaseAuto";
import { WinContainer } from "./WinContainer";
import { AutoBettingEvent } from "../../events/auto_betting_events/AutoBettingEvent";
import { WinContainerEvent } from "../../events/WinContainerEvent";
import { GlobalConfig } from "../../config/GlobalConfig";
import { GameState } from "../../manage_game_states/GameState";
import { GameStateManager } from "../../manage_game_states/GameStateManager";

const buttonSize = {
    width: 128,
    height: 110
}

export class BoardContainer extends Container {
    // private buttonSize: number = 0;
    private buttons: Button[][] = [];
    private buttonPressedAutoCount: number = 0;

    // Variables for the auto
    private isAuto: boolean = false;
    private ticker: Ticker;
    private diamondCount: number = 0;
    private mineCount: number = 0;

    // Win container
    private winContainer: WinContainer;

    constructor() {
        super();

        // Listeners for the manual bet events
        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));
        globalEmitter.on(ManualBettingEvent.PICK_RANDOM, this.onPickRandom.bind(this));

        // Listeners for the game mode change events
        globalEmitter.on(GameModeChangeEvent.AUTO, this.onAutoModeStart.bind(this));
        globalEmitter.on(GameModeChangeEvent.MANUAL, this.onAutoModeStop.bind(this));

        this.winContainer = new WinContainer();

        this.initBoard();

        this.addChild(this.winContainer);

        this.ticker = new Ticker();
    }

    private initBoard() {
        const rows = GlobalConfig.TOTAL_ROWS;
        const columns = GlobalConfig.TOTAL_COLUMNS;

        this.winContainer.position.set(
            (buttonSize.width * rows - this.winContainer.width) / 2,
            (buttonSize.height * columns - this.winContainer.height) / 2
        );

        for (let i = 0; i < rows; i++) {
            this.buttons[i] = [];
            const columnContainer = new Container({ x: i * buttonSize.width, y: 0 });
            for (let j = 0; j < columns; j++) {
                const button = new Button({ width: buttonSize.width, height: buttonSize.height });
                button.defaultView = this.getButtonView('tile.png');
                button.anchor.set(0, 0);

                // Adjust the position
                button.y = j * buttonSize.height;

                // Handle onclick event
                button.onPress.connect(() => this.onPress(button, i, j));

                columnContainer.addChild(button);
                this.buttons[i][j] = button;
            }
            this.addChild(columnContainer);
        }
    }

    private async onPress(btn: Button, i: number, j: number) {
        // Seperate logic for the auto mode 
        if (this.isAuto) {
            this.onPressAutoMode(btn);
            return;
        }

        // Stop if the game isn't start and button pressed before
        if (!GameStateManager.getInstance().isBetting()) return;
        if (btn.pressed) return;

        let itemType = await GetItem.getItemType(i, j);

        // Raise event to update UI
        globalEmitter.emit(ManualBettingEvent.PRESSED_ITEM, itemType);

        // Update default view
        if (itemType === ItemType.DIAMOND)
            btn.defaultView = this.getButtonView("diamond.png");
        else if (itemType === ItemType.MINE) {
            btn.defaultView = this.getButtonView("bomb.png");

            GameStateManager.getInstance().setState(GameState.NOT_BETTING);

            // Reveal all the buttons
            this.reavealAllButtons();
        }

        btn.setSize(buttonSize.width, buttonSize.height);
        btn.pressed = true;
    }

    private onPressAutoMode(btn: Button) {
        if (GameStateManager.getInstance().getState() === GameState.BETTING) return;

        if (!btn.pressed) {
            btn.pressed = true;
            btn.alpha = 0.75;
            this.buttonPressedAutoCount++;
        } else {
            btn.pressed = false;
            btn.alpha = 1;
            this.buttonPressedAutoCount--;
        }

        globalEmitter.emit(AutoBettingEvent.PRESSED_ITEM, this.buttonPressedAutoCount);
    }

    private onGameStateChange(state: GameState, mines: number, numberOfGames: number = -1) {
        if (state === GameState.BETTING) {
            if (this.isAuto && numberOfGames !== -1) {
                this.handleStartAutoBet(mines, numberOfGames);
                return;
            }

            if (mines) {
                // Generate the matrix
                GetItem.generateMatrix(mines);

                // Reset all the buttons
                this.resetAllButtons();
            }
        }
        else if (state === GameState.NOT_BETTING) {
            if (this.isAuto) {
                this.resetAllButtons();
                this.ticker.stop();
                return;
            }

            this.reavealAllButtons();
        }
    }

    private autoBetCallback: (() => void) | null = null;
    private handleStartAutoBet(mines: number, numberOfGames: number) {
        // console.log(numberOfGames);

        // if exist previous callback
        if (this.autoBetCallback) {
            this.ticker.remove(this.autoBetCallback);
        }

        let elapsed = 0;
        let phase: PhaseAuto = PhaseAuto.REVEAL;
        this.autoBetCallback = () => {
            elapsed += this.ticker.deltaMS;

            if (elapsed >= 1000) {
                if (phase === PhaseAuto.REVEAL) {
                    GetItem.generateMatrix(mines);
                    this.reavealAllButtons();
                    phase = PhaseAuto.RESET;
                }
                else if (phase === PhaseAuto.RESET) {
                    this.disableWinContainer();
                    this.resetAllButtons();
                    phase = PhaseAuto.REVEAL;

                    if (numberOfGames !== 0) {
                        numberOfGames--;

                        if (numberOfGames <= 0) GameStateManager.getInstance().setState(GameState.NOT_BETTING);
                    }
                }

                elapsed = 0;
            }
        };


        this.ticker.add(this.autoBetCallback);
        this.ticker.start();
    }

    private checkGameResult() {
        if (!this.isAuto) return;
        // console.log(this.diamondCount, this.mineCount);

        // If loss notify for the UI update the bet value
        if (this.mineCount > 0) {
            globalEmitter.emit(AutoBettingEvent.ON_LOSS);
            return;
        }

        // If win send diamond count to auto bet container
        globalEmitter.emit(AutoBettingEvent.ON_WIN, this.diamondCount);
    }

    private disableWinContainer() {
        globalEmitter.emit(WinContainerEvent.DIASABLE);
    }

    private resetAllButtons(isTheFirstTime: boolean = false) {
        for (let i = 0; i < this.buttons.length; i++) {
            for (let j = 0; j < this.buttons[i].length; j++) {

                // If is not auto or the first time switch to auto mode
                if (!this.isAuto || isTheFirstTime)
                    this.buttons[i][j].pressed = false;

                this.buttons[i][j].alpha = this.isAuto && this.buttons[i][j].pressed ? 0.75 : 1;
                this.buttons[i][j].defaultView = this.getButtonView("button.png");

                this.buttons[i][j].setSize(buttonSize.width, buttonSize.height);
            }
        }
    }

    private async reavealAllButtons() {
        this.diamondCount = 0;
        this.mineCount = 0;

        for (let i = 0; i < this.buttons.length; i++) {
            for (let j = 0; j < this.buttons[i].length; j++) {
                const item = await GetItem.getItemType(i, j);
                if (item === ItemType.DIAMOND) {
                    this.buttons[i][j].defaultView = this.getButtonView("diamond.png");

                    // Increase diamond count
                    if (this.buttons[i][j].pressed) this.diamondCount++;
                }
                else if (item === ItemType.MINE) {
                    this.buttons[i][j].defaultView = this.getButtonView("bomb.png");

                    // Increase mine count
                    if (this.buttons[i][j].pressed) this.mineCount++;
                }

                this.buttons[i][j].alpha = this.buttons[i][j].pressed ? 1 : 0.35;
                this.buttons[i][j].setSize(buttonSize.width, buttonSize.height);
            }
        }

        // console.log(this.diamondCount, this.mineCount);
        this.checkGameResult();
    }


    private getButtonView(path: string): Sprite {
        let sprite = Sprite.from(path);
        return sprite;
    }

    private async onPickRandom() {
        const available: { btn: Button; i: number; j: number }[] = [];

        for (let i = 0; i < this.buttons.length; i++) {
            for (let j = 0; j < this.buttons[i].length; j++) {
                const btn = this.buttons[i][j];
                if (!btn.pressed) {
                    available.push({ btn, i, j });
                }
            }
        }

        if (available.length === 0) return;

        // Random one button
        const randomIndex = Math.floor(Math.random() * available.length);
        const { btn, i, j } = available[randomIndex];

        // Call onpress to handle random button clicked
        this.onPress(btn, i, j);
    }

    private onAutoModeStart() {
        this.isAuto = true;

        this.buttonPressedAutoCount = 0;

        // Reset the board
        this.resetAllButtons(true);
    }

    private onAutoModeStop() {
        this.isAuto = false;

        this.resetAllButtons();

        // Reset button press count
        this.buttonPressedAutoCount = 0;
    }
}