import { Container, Text, Ticker } from "pixi.js";
import { ItemType } from "./ItemType";
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
import { gameService } from "../../api/services/GameService";
import { BetApiResponse } from "../../api/models/BetResponse";
import { ApiEvent } from "../../events/api/ApiEvent";
import { LastActivityApiResponse } from "../../api/models/LastActivityResponse";
import { CashoutApiResponse } from "../../api/models/CashoutResponse";
import { ResultApiResponse } from "../../api/models/ResultResponse";
import { PickApiResponse } from "../../api/models/PickResponse";
import { AutoBetApiResponse } from "../../api/models/AutobetResponse";

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
    private tilePressedAutoCount: number = 0;

    // Variables for the auto
    private isAuto: boolean = false;
    private ticker: Ticker;
    private diamondCount: number = 0;
    private mineCount: number = 0;

    // Win container
    private winContainer: WinContainer;

    private balanceText: Text;
    private previousBombfield: number[] = [];

    // Tile selected in auto mode
    private selectedTilesIndex: number[] = [];

    // Save bet amount in auto mode
    private betAmount: number = 1;

    constructor() {
        super();

        // Listeners for the manual bet events
        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));
        globalEmitter.on(ManualBettingEvent.PICK_RANDOM, this.onPickRandom.bind(this));

        // Listeners for the game mode change events
        globalEmitter.on(GameModeChangeEvent.AUTO, this.onAutoModeStart.bind(this));
        globalEmitter.on(GameModeChangeEvent.MANUAL, this.onAutoModeStop.bind(this));

        // Listensers for the response from api
        globalEmitter.on(ApiEvent.LAST_ACTIVITY_RESPONSE, this.onLastActivityResponse.bind(this));
        globalEmitter.on(ApiEvent.BET_RESPONSE, this.onBetResponse.bind(this));
        globalEmitter.on(ApiEvent.CASHOUT_RESPONSE, this.onCashoutResponse.bind(this));
        globalEmitter.on(ApiEvent.RESULT_RESPONSE, this.onResultResponse.bind(this));
        globalEmitter.on(ApiEvent.AUTO_BET_RESPONSE, this.onAutoBetResponse.bind(this));

        // Handle pick response for the auto mode
        // globalEmitter.on(ApiEvent.PICK_RESPONSE, this.onPickResponse.bind(this));

        // Handle bet value change
        globalEmitter.on(AutoBettingEvent.BET_AMOUNT_CHANGE, this.onBetAmountChange.bind(this));

        this.winContainer = new WinContainer();

        this.sortableChildren = true;
        this.initBoard();

        this.addChild(this.winContainer);

        this.ticker = new Ticker();


        this.balanceText = new Text({
            text: 'Rp: ',
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

        // gameService.postPick([3]);

        // gameService.postCashout();
    }

    private onAutoBetResponse(autoBetResponse: AutoBetApiResponse) {
        this.updateBalanceText(autoBetResponse.data.balance, autoBetResponse.data.currency);
    }

    private onBetAmountChange(newBetAmount: number) {
        this.betAmount = newBetAmount;
    }

    private onBetResponse(betResponse: BetApiResponse) {
        this.updateBalanceText(betResponse.data.balance, betResponse.data.currency);
    }

    private onResultResponse(resultResponse: ResultApiResponse) {
        this.updateBalanceText(resultResponse.data.balance, resultResponse.data.currency);
    }

    private onCashoutResponse(cashoutResponse: CashoutApiResponse) {
        if (cashoutResponse.data?.end_round) {
            this.previousBombfield = cashoutResponse.data.bomb_field;
        }

        this.reavealAllTiles();
    }

    private onLastActivityResponse(response: LastActivityApiResponse) {
        // console.log(response);

        // console.log("Raw data:", JSON.stringify(response.data, null, 2));
        // console.log("last_activity:", response.data.last_activity);
        // console.log("end_round:", response.data.last_activity?.end_round);

        this.updateBalanceText(response.data.balance, response.data.currency);

        // Player doesn't play game before
        if (response.data.last_activity == null) return;

        const lastActivityData = response.data.last_activity;

        // Previous game has finished and already calculated result on BE server
        if (lastActivityData.is_settle) return;

        // Open tile previous clicked
        lastActivityData.field.forEach((index) => {
            this.tiles[index].pressed = true;
            this.tiles[index].handleOpen(ItemType.CROWN);
        });

        // If previous game has finished but not send post result
        if (lastActivityData.end_round) {
            gameService.postResult().then((resultResponse) => globalEmitter.emit(ApiEvent.RESULT_RESPONSE, resultResponse));

            this.previousBombfield = lastActivityData.bomb_field;
            this.reavealAllTiles();

            globalEmitter.emit(WinContainerEvent.ENABLE, response.data.last_activity.multiplier, response.data.last_activity.total_win);
            return;
        }

        // Game isn't finished before (TODO)
        else {
            GameStateManager.getInstance().setState(GameState.BETTING);
        }
    }

    private updateBalanceText(balance: number, currency: string) {
        // console.log(balance);

        this.balanceText.text = currency === "IDR" ? "Rp: " : "$: ";
        this.balanceText.text += String(balance);
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
        // gameService.postCashout();
        // console.log(this.tilesAPI)
    }

    private onPress(tile: Tile, isRandom?: boolean) {
        this.updateTileIndex(tile, 5);
        if (!tile.canPress) return;

        // Seperate logic for the auto mode 
        if (this.isAuto) {
            this.onPressAutoMode(tile);
            return;
        }

        // Stop if the game isn't start and Tile pressed before
        if (!GameStateManager.getInstance().isBetting()) return;
        if (tile.pressed) return;

        let tileIndex = isRandom ? -1 : this.tiles.indexOf(tile);

        //#region Send Manual Pick
        gameService.postPick([tileIndex]).then((pickResponse) => {
            // Emit pick response to update ui
            globalEmitter.emit(ApiEvent.PICK_RESPONSE, pickResponse);

            if (isRandom) {
                tileIndex = pickResponse.data.field[pickResponse.data.field.length - 1];
                tile = this.tiles[tileIndex];
            }

            let itemType = pickResponse.data.end_round ? ItemType.BOMB : ItemType.CROWN;

            tile.pressed = true;
            tile.handleOpen(itemType);

            // Raise event to update UI
            globalEmitter.emit(ManualBettingEvent.PRESSED_ITEM, itemType);

            // Update default view
            if (itemType === ItemType.CROWN) {
                this.updateTileIndex(tile, 9);
            } else if (itemType === ItemType.BOMB) {
                this.updateTileIndex(tile, 99);

                this.previousBombfield = pickResponse.data.bomb_field;

                GameStateManager.getInstance().setState(GameState.NOT_BETTING);

                // Reveal all the Tiles
                this.reavealAllTiles();
                gameService.postResult().then((resultResponse) => globalEmitter.emit(ApiEvent.RESULT_RESPONSE, resultResponse));
            }
        });
        //#endregion
    }

    private onPressAutoMode(tile: Tile) {
        if (GameStateManager.getInstance().getState() === GameState.BETTING) return;

        if (!tile.pressed) {
            tile.pressed = true;
            tile.alpha = 0.75;
            this.tilePressedAutoCount++;

            // Get index of tile
            this.selectedTilesIndex.push(this.tiles.indexOf(tile));
        } else {
            tile.pressed = false;
            tile.alpha = 1;
            this.tilePressedAutoCount--;

            // Remove selected index
            let selectedIndex = this.tiles.indexOf(tile);
            this.selectedTilesIndex.splice(this.selectedTilesIndex.indexOf(selectedIndex), 1);
        }

        globalEmitter.emit(AutoBettingEvent.PRESSED_ITEM, this.tilePressedAutoCount);
    }

    private firstBet: boolean = true;
    private onGameStateChange(
        state: GameState,
        bombCount: number,
        numberOfGames: number = -1,
        betAmount: number) {
        if (state === GameState.BETTING) {
            if (this.isAuto && numberOfGames !== -1) {
                // console.log(betAmount, bombCount, numberOfGames);
                this.handleStartAutoBet(betAmount, bombCount, numberOfGames);
                return;
            }

            if (bombCount) {

                if (!this.firstBet) {
                    this.interactiveChildren = false;
                }

                this.resetAllTiles();

                // Mock time delay for new turn (depend on animation disappear duration)
                setTimeout(() => {
                    // Generate the matrix
                    // GetItem.generateMatrix(mines);

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
        }
    }

    //#region Handle auto bet 
    private autoBetCallback: (() => void) | null = null;
    private handleStartAutoBet(betAmount: number, bombCount: number, numberOfGames: number) {
        this.betAmount = betAmount;

        // if exist previous callback
        if (this.autoBetCallback) {
            this.ticker.remove(this.autoBetCallback);
        }

        let elapsed = 0;
        let phase: PhaseAuto = PhaseAuto.REVEAL;
        this.autoBetCallback = () => {
            elapsed += this.ticker.deltaMS;

            if (elapsed >= 2500) {
                if (phase === PhaseAuto.REVEAL) {
                    gameService.postAutoBet(this.betAmount, bombCount, this.selectedTilesIndex).then((autoBetResponse) => {
                        globalEmitter.emit(ApiEvent.AUTO_BET_RESPONSE, autoBetResponse);

                        if (autoBetResponse.data.end_round) {
                            // Send result request
                            gameService.postResult().then((resultResponse) => {
                                globalEmitter.emit(ApiEvent.RESULT_RESPONSE, resultResponse);

                                this.previousBombfield = autoBetResponse.data?.bomb_field;
                                this.reavealAllTiles(autoBetResponse);
                                phase = PhaseAuto.RESET;
                            });
                        }
                        else {
                            console.error("Something went wrong when auto mode running!");
                        }
                    });
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
    //#endregion

    private checkGameResult(pickResponse?: PickApiResponse) {

        // If loss notify for the UI update the bet value
        if (this.mineCount > 0) {
            globalEmitter.emit(AutoBettingEvent.ON_LOSS);
            return;
        }

        // If win send diamond count to auto bet container
        globalEmitter.emit(AutoBettingEvent.ON_WIN, this.diamondCount, pickResponse);
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
            let itemType = this.previousBombfield.includes(i) ? ItemType.BOMB : ItemType.CROWN;
            this.tiles[i].handleDisAppear(itemType);

            this.tiles[i].alpha = this.isAuto && this.tiles[i].pressed ? 0.75 : 1;

            // Reset tile z index
            this.updateTileIndex(this.tiles[i], 0);
        }

    }

    private reavealAllTiles(pickResponse?: PickApiResponse) {
        this.diamondCount = 0;
        this.mineCount = 0;

        for (let i = 0; i < this.tiles.length; i++) {
            const itemType = this.previousBombfield.includes(i) ? ItemType.BOMB : ItemType.CROWN;
            if (itemType === ItemType.CROWN) {
                // this.tiles[i].defaultView = this.getTileView("diamond.png");

                // Increase diamond count
                if (this.tiles[i].pressed) this.diamondCount++;
            }
            else if (itemType === ItemType.BOMB) {
                // Update index if item is the bomb
                this.updateTileIndex(this.tiles[i], 100);

                // Increase mine count
                if (this.tiles[i].pressed) this.mineCount++;
            }

            this.tiles[i].alpha = this.tiles[i].pressed ? 1 : 0.35;
            if (!this.tiles[i].pressed || this.isAuto)
                this.tiles[i].handleOpen(itemType);

        }

        // console.log(this.diamondCount, this.mineCount);
        if (this.isAuto)
            this.checkGameResult(pickResponse);
    }

    private updateTileIndex(tile: Tile, zIndex: number) {
        tile.zIndex = zIndex;
    }

    private onPickRandom(): void {
        const available: Tile[] = this.tiles.filter((btn) => !btn.pressed);

        if (available.length === 0) return;

        const randomIndex = Math.floor(Math.random() * available.length);
        const btn = available[randomIndex];

        this.onPress(btn, true);
    }

    private onAutoModeStart() {
        this.isAuto = true;

        this.changeTileColor();

        this.tilePressedAutoCount = 0;

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
        this.tilePressedAutoCount = 0;

        // Reset selected tiles
        this.selectedTilesIndex = [];
    }
}