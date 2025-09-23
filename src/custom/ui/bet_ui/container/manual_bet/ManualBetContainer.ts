
import { Button } from "../../../../../app/ui/Button";
import { ItemType } from "../../../../_game/board/ItemType";
import { gameService } from "../../../../api/services/GameService";
import { GlobalConfig } from "../../../../config/GlobalConfig";
import { GameStateEvent } from "../../../../events/game_states/GameStateEvent";
import { globalEmitter } from "../../../../events/GlobalEmitter";
import { ManualBettingEvent } from "../../../../events/manual_betting_events/ManualBettingEvent";
import { WinContainerEvent } from "../../../../events/WinContainerEvent";
import { apiClient } from "../../../../get_data/GetItem";
import { GetNumberOfMines } from "../../../../get_data/GetNumberOfMines";
import { GameState } from "../../../../manage_game_states/GameState";
import { GameStateManager } from "../../../../manage_game_states/GameStateManager";
import { BetContainer } from "../BetContainer";
import { ManualBettingContainer } from "./ManualBettingContainer";

export class ManualBetContainer extends BetContainer {

    private manualBettingContainer: ManualBettingContainer;
    private diamondRemain: number = 0;
    private diamondCollected: number = 0;

    // Increase per time when player press a diamond(depend on number of mines)
    private profitMultiplierPerTime: number = 0;

    private betButton: Button;

    constructor(x: number, y: number) {
        super(x, y);

        // Register callback when user click a mine 
        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));

        // Register listener to handle item pressed event
        globalEmitter.on(ManualBettingEvent.PRESSED_ITEM, this.onItemPressed.bind(this));

        this.manualBettingContainer = new ManualBettingContainer(this.selectModeGroup.x, this.selectModeGroup.y);

        // Add a callback to handle event betting completed
        this.manualBettingContainer.onBettingCompleted = this.onBettingCompleted.bind(this);

        this.betButton = new Button({
            text: 'Bet',
            width: 200,
            height: 100,
            fontSize: 40
        });

        this.betButton.anchor.set(0, 0);
        this.betButton.position.set((this.selectModeGroup.width - this.betButton.width) / 2, this.selectModeGroup.y + this.selectModeGroup.height + 4);

        // Handle bet event
        this.betButton.onPress.connect(this.onBetButtonClicked.bind(this));

        this.addChild(this.manualBettingContainer, this.betButton);
        // this.addChild(this.manualBettingContainer);
    }

    private onBetButtonClicked() {
        const mineCount = GetNumberOfMines.getNumberOfMines(this.selectModeGroup.getCurrentMode());
        
        // Call api 
        gameService.postBet(Number(this.betAmount.getInputAmount().value), mineCount).then((betResponse) => {
            console.log(betResponse);
        });

        GameStateManager.getInstance().setState(GameState.BETTING);

        // Emit event to generate the board
        globalEmitter.emit(GameStateEvent.STATE_CHANGE, GameState.BETTING, mineCount);

        // Emit event to disable win container
        globalEmitter.emit(WinContainerEvent.DIASABLE);

        // Initialize diamond count
        this.diamondRemain = GlobalConfig.TOTAL_COLUMNS * GlobalConfig.TOTAL_ROWS - (mineCount);
        this.diamondCollected = 0;

        // Initialize profitMultiplier per time
        this.profitMultiplierPerTime = (mineCount) / 10;

        apiClient.bet(Number(this.betAmount.getInputAmount().value), mineCount).then((value) => {
            console.log(value);
        });

    }

    private onBettingCompleted() {
        GameStateManager.getInstance().setState(GameState.NOT_BETTING);

        // Enable win container
        globalEmitter.emit(WinContainerEvent.ENABLE, this.getProfitMultipler(), this.getTotalProfit());
    }

    private onGameStateChange(state: GameState) {
        if (state === GameState.NOT_BETTING) this.updateUI(true);
        else if (state === GameState.BETTING) this.updateUI(false);
    }

    private updateUI(isBetCompleted: boolean) {
        const mineCount = GetNumberOfMines.getNumberOfMines(this.selectModeGroup.getCurrentMode());

        if (isBetCompleted) {
            this.manualBettingContainer.visible = false;

            this.selectModeGroup.visible = true;
            this.betButton.visible = true;
        }
        else {
            this.manualBettingContainer.visible = true;
            this.manualBettingContainer.setGameConfig(
                mineCount,
                GlobalConfig.TOTAL_COLUMNS * GlobalConfig.TOTAL_ROWS - mineCount,
                Number(this.betAmount.getInputAmount().value),
            );

            this.selectModeGroup.visible = false;
            this.betButton.visible = false;
        }
    }

    private onItemPressed(itemType: ItemType) {
        if (itemType === ItemType.CROWN) {
            this.diamondCollected++;

            this.manualBettingContainer.setGameConfig(null, --this.diamondRemain, this.getTotalProfit(), this.getProfitMultipler());
        } else if (itemType === ItemType.BOMB) {
            this.manualBettingContainer.setGameConfig(null, this.diamondRemain, 0);
        }
    }

    private getTotalProfit(): number {
        let profitMultiplier = this.getProfitMultipler();
        return Number(this.betAmount.getInputAmount().value) * profitMultiplier;
    }

    private getProfitMultipler(): number {
        return 1 + this.diamondCollected * this.profitMultiplierPerTime;
    }
}