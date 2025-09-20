import { Container, Ticker } from "pixi.js";
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
    // private TileSize: number = 0;
    private tiles: Tile[][] = [];
    private tilesAPI: Tile[] = [];
    private TilePressedAutoCount: number = 0;

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

        this.sortableChildren = true;
        this.initBoard();

        this.addChild(this.winContainer);

        this.ticker = new Ticker();
    }

    private initBoard() {
        const rows = GlobalConfig.TOTAL_ROWS;
        const columns = GlobalConfig.TOTAL_COLUMNS;

        this.winContainer.position.set(
            (tileSize.width * rows - this.winContainer.width) / 2,
            (tileSize.height * columns - this.winContainer.height) / 2
        );

        for (let i = 0; i < rows; i++) {
            this.tiles[i] = [];

            for (let j = 0; j < columns; j++) {
                const tile = new Tile();

                tile.handleAppear();

                // Adjust the position
                tile.position.set(j * tileSize.width + offsetTileBoard.x, i * tileSize.height + offsetTileBoard.y);

                // Handle onclick event
                tile.onPress.connect(() => this.onPress(tile, i, j));
                tile.onOut.connect(() => tile.zIndex = 0);

                this.addChild(tile);
                this.tiles[i][j] = tile;
            }
        }

        this.tilesAPI = this.tiles.flat();
        // console.log(this.tilesAPI)
    }

    private onPress(tile: Tile, i: number, j: number) {
        // let itemTypeTest =  GetItem.getItemType(i, j);
        // // console.log(itemTypeTest);
        // tile.handleOpen(itemTypeTest);
        // Seperate logic for the auto mode 
        if (this.isAuto) {
            this.onPressAutoMode(tile);
            return;
        }

        // Stop if the game isn't start and Tile pressed before
        if (!GameStateManager.getInstance().isBetting()) return;
        if (tile.pressed) return;

        let itemType = GetItem.getItemType(i, j);

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

            tile.pressed = true;
            // Reveal all the Tiles
            this.reavealAllTiles();
        }

        // tile.setSize(tileSize.width, tileSize.height);
        tile.pressed = true;
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
                // Generate the matrix
                GetItem.generateMatrix(mines);

                // Reset all the Tiles
                if (this.firstBet) {
                    this.firstBet = false;
                    return;
                }

                this.resetAllTiles();
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
                    GetItem.generateMatrix(mines);
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
            for (let j = 0; j < this.tiles[i].length; j++) {

                // If is not auto or the first time switch to auto mode
                if (!this.isAuto || isTheFirstTime)
                    this.tiles[i][j].pressed = false;

                this.tiles[i][j].handleDisAppear(GetItem.getItemType(i, j));


                this.tiles[i][j].alpha = this.isAuto && this.tiles[i][j].pressed ? 0.75 : 1;

                // Reset tile z index
                this.updateTileIndex(this.tiles[i][j], 0);
            }
        }
    }

    private reavealAllTiles() {
        this.diamondCount = 0;
        this.mineCount = 0;

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                const itemType = GetItem.getItemType(i, j);
                if (itemType === ItemType.CROWN) {
                    // this.tiles[i][j].defaultView = this.getTileView("diamond.png");

                    // Increase diamond count
                    if (this.tiles[i][j].pressed) this.diamondCount++;
                }
                else if (itemType === ItemType.BOMB) {
                    // Update index if item is the bomb
                    this.updateTileIndex(this.tiles[i][j], 99);

                    // Increase mine count
                    if (this.tiles[i][j].pressed) this.mineCount++;
                }

                this.tiles[i][j].alpha = this.tiles[i][j].pressed ? 1 : 0.35;
                // this.tiles[i][j].setSize(tileSize.width, tileSize.height);
                if (!this.tiles[i][j].pressed || this.isAuto)
                    this.tiles[i][j].handleOpen(itemType);
            }
        }

        // console.log(this.diamondCount, this.mineCount);
        this.checkGameResult();
    }

    private updateTileIndex(tile: Tile, zIndex: number) {
        tile.zIndex = zIndex;
    }

    private onPickRandom() {
        const available: { btn: Tile; i: number; j: number }[] = [];

        for (let i = 0; i < this.tiles.length; i++) {
            for (let j = 0; j < this.tiles[i].length; j++) {
                const btn = this.tiles[i][j];
                if (!btn.pressed) {
                    available.push({ btn, i, j });
                }
            }
        }

        if (available.length === 0) return;

        // Random one Tile
        const randomIndex = Math.floor(Math.random() * available.length);
        const { btn, i, j } = available[randomIndex];

        // Call onpress to handle random Tile clicked
        this.onPress(btn, i, j);
    }

    private onAutoModeStart() {
        this.isAuto = true;

        this.changeTileColor();


        this.TilePressedAutoCount = 0;

        // Reset the board
        this.resetAllTiles(true);
    }

    private changeTileColor() {
        this.tilesAPI.forEach(item => {
            item.handleSwitchMode(this.isAuto);
        });
    }

    private onAutoModeStop() {
        this.isAuto = false;

        this.changeTileColor();

        this.resetAllTiles();

        // Reset Tile press count
        this.TilePressedAutoCount = 0;
    }
}