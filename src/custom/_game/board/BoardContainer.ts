import { Container, Text, Ticker } from "pixi.js";
import { ItemType } from "./ItemType";
import { apiClient, ApiClient } from "../../get_data/ApiClient";
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
import { Tile } from "../../ui/tile_button/Tile";

const tileSize = {
    width: 128,
    height: 110
}

const offsetTileBoard = {
    x: 50,
    y: 40
}

export class BoardContainer extends Container {
    private tiles: Tile[] = [];
    private TilePressedAutoCount: number = 0;

    // Variables for the auto
    private isAuto: boolean = false;
    private ticker: Ticker;
    private diamondCount: number = 0;
    private mineCount: number = 0;

    // Win container
    private winContainer: WinContainer;

    private balanceText: Text;

    constructor() {
        super();

        // Listeners for the manual bet events
        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));
        globalEmitter.on(ManualBettingEvent.PICK_RANDOM, this.onPickRandom.bind(this));

        // Listeners for the game mode change events
        globalEmitter.on(GameModeChangeEvent.AUTO, this.onAutoModeStart.bind(this));
        globalEmitter.on(GameModeChangeEvent.MANUAL, this.onAutoModeStop.bind(this));

        this.winContainer = new WinContainer();

        this.sortableChildren = true;
        this.initBoard();

        this.addChild(this.winContainer);

        this.ticker = new Ticker();

        
        this.balanceText = new Text({
            text: 'Balance',
            style: {
                fontFamily: 'Arial',
                fontSize: 50,
                fill: 'white',
                align: 'center',
            }
        });
        // this.balanceText.position.set(0, -250);
        this.balanceText.zIndex = 100;
        this.addChild(this.balanceText);

        apiClient.fetchData().then((data) => {
            if (data.last_activity == null) {
                console.log("null");
            }
            
            let currency = data.data.currency === "IDR" ? "Rp: " : "$: ";
            this.balanceText.text = `${currency}` + data.data.balance;
        });

    }

    private initBoard() {
        const rows = GlobalConfig.TOTAL_ROWS;
        const columns = GlobalConfig.TOTAL_COLUMNS;

        this.winContainer.position.set(
            (tileSize.width * rows - this.winContainer.width) / 2,
            (tileSize.height * columns - this.winContainer.height) / 2
        );

        let index = 0;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const tile = new Tile();

                tile.handleAppear();

                // Adjust the position
                tile.position.set(j * tileSize.width + offsetTileBoard.x, i * tileSize.height + offsetTileBoard.y);

                // Handle onclick event
                tile.onPress.connect(() => this.onPress(tile));
                tile.onOut.connect(() => tile.zIndex = 0);

                this.addChild(tile);
                this.tiles[index++] = tile;
            }
        }

        // this.tilesAPI = this.tiles.flat();
        // console.log(this.tilesAPI)
    }

    private onPress(tile: Tile) {
        if (!tile.canPress) return;

        // Seperate logic for the auto mode 
        if (this.isAuto) {
            this.onPressAutoMode(tile);
            return;
        }

        // Stop if the game isn't start and Tile pressed before
        if (!GameStateManager.getInstance().isBetting()) return;
        if (tile.pressed) return;

        let tileIndex = this.tiles.indexOf(tile);
        let itemType = ApiClient.getItemType(tileIndex);

        tile.pressed = true;
        tile.handleOpen(itemType);

        // Raise event to update UI
        globalEmitter.emit(ManualBettingEvent.PRESSED_ITEM, itemType);

        // Update default view
        if (itemType === ItemType.CROWN) {
            this.updateTileIndex(tile, 9);
            // btn.defaultView = this.getTileView("diamond.png");
        } else if (itemType === ItemType.BOMB) {
            // btn.defaultView = this.getTileView("bomb.png");
            this.updateTileIndex(tile, 99);

            GameStateManager.getInstance().setState(GameState.NOT_BETTING);

            // Reveal all the Tiles
            this.reavealAllTiles();
        }
    }

    private onPressAutoMode(tile: Tile) {
        if (GameStateManager.getInstance().getState() === GameState.BETTING) return;

        if (!tile.pressed) {
            tile.pressed = true;
            tile.alpha = 0.75;
            this.TilePressedAutoCount++;
        } else {
            tile.pressed = false;
            tile.alpha = 1;
            this.TilePressedAutoCount--;
        }

        globalEmitter.emit(AutoBettingEvent.PRESSED_ITEM, this.TilePressedAutoCount);
    }

    private firstBet: boolean = true;
    private onGameStateChange(state: GameState, mines: number, numberOfGames: number = -1) {
        if (state === GameState.BETTING) {
            if (this.isAuto && numberOfGames !== -1) {
                this.handleStartAutoBet(mines, numberOfGames);
                return;
            }

            if (mines) {
                if (!this.firstBet)
                    this.interactiveChildren = false;

                this.resetAllTiles();

                // Mock time delay for new turn (depend on animation disappear duration)
                setTimeout(() => {
                    // Generate the matrix
                    ApiClient.generateMatrix(mines);

                    this.interactiveChildren = true;

                    // Reset all the Tiles
                    if (this.firstBet) {
                        this.firstBet = false;
                        return;
                    }
                }, 1000);
            }
        }
        else if (state === GameState.NOT_BETTING) {
            if (this.isAuto) {
                this.resetAllTiles();
                this.ticker.stop();
                return;
            }

            this.reavealAllTiles();
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
                    ApiClient.generateMatrix(mines);
                    this.reavealAllTiles();
                    phase = PhaseAuto.RESET;
                }
                else if (phase === PhaseAuto.RESET) {
                    this.disableWinContainer();
                    this.resetAllTiles();
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

    private resetAllTiles(isTheFirstTime: boolean = false) {
        for (let i = 0; i < this.tiles.length; i++) {
            // If is not auto or the first time switch to auto mode
            if (!this.isAuto || isTheFirstTime)
                this.tiles[i].pressed = false;

            // Handle for manual -> auto mode
            this.tiles[i].handleDisAppear(ApiClient.getItemType(i));

            this.tiles[i].alpha = this.isAuto && this.tiles[i].pressed ? 0.75 : 1;

            // Reset tile z index
            this.updateTileIndex(this.tiles[i], 0);
        }

    }

    private reavealAllTiles() {
        this.diamondCount = 0;
        this.mineCount = 0;

        for (let i = 0; i < this.tiles.length; i++) {
            const itemType = ApiClient.getItemType(i);
            if (itemType === ItemType.CROWN) {
                // this.tiles[i].defaultView = this.getTileView("diamond.png");

                // Increase diamond count
                if (this.tiles[i].pressed) this.diamondCount++;
            }
            else if (itemType === ItemType.BOMB) {
                // Update index if item is the bomb
                this.updateTileIndex(this.tiles[i], 99);

                // Increase mine count
                if (this.tiles[i].pressed) this.mineCount++;
            }

            this.tiles[i].alpha = this.tiles[i].pressed ? 1 : 0.35;
            if (!this.tiles[i].pressed || this.isAuto)
                this.tiles[i].handleOpen(itemType);

        }

        // console.log(this.diamondCount, this.mineCount);
        this.checkGameResult();
    }

    private updateTileIndex(tile: Tile, zIndex: number) {
        tile.zIndex = zIndex;
    }

    private onPickRandom(): void {
        const available: Tile[] = this.tiles.filter((btn) => !btn.pressed);

        if (available.length === 0) return;

        const randomIndex = Math.floor(Math.random() * available.length);
        const btn = available[randomIndex];

        this.onPress(btn);
    }

    private onAutoModeStart() {
        this.isAuto = true;

        this.changeTileColor();

        this.TilePressedAutoCount = 0;

        // Reset the board
        this.resetAllTiles(true);
    }

    private changeTileColor() {
        this.tiles.forEach(item => item.handleSwitchMode(this.isAuto));
    }

    private onAutoModeStop() {
        this.isAuto = false;

        this.changeTileColor();

        this.resetAllTiles();

        // Reset Tile press count
        this.TilePressedAutoCount = 0;
    }
}