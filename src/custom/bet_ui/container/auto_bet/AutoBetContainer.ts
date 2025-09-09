import { Button } from "../../../../app/ui/Button";
import { LabeledInput } from "../../base/LabeledInput";
import { BetContainer } from "../BetContainer";
import { CustomLabelInput } from "./CustomLabelInput";
import { InputNumberOfGames } from "./InputNumberOfGames";
import { CustomInputStopAuto } from "./CustomInputStopAuto";
import { InputBetAmount } from "../../bet_amount/InputBetAmount";
import { globalEmitter } from "../../../events/GlobalEmitter";
import { GameStateEvent } from "../../../events/game_states/GameStateEvent";
import { AutoBettingEvent } from "../../../events/auto_betting_events/AutoBettingEvent";
import { WinContainerEvent } from "../../../events/WinContainerEvent";
import { GetNumberOfMines } from "../../../get_data/GetNumberOfMines";
import { GameStateManager } from "../../../manage_game_states/GameStateManager";
import { GameState } from "../../../manage_game_states/GameState";

const MAX_NUMBER_OF_GAMES = 999999999;

const defaultButtonSize = {
    width: 290,
    height: 90
}

export class AutoBetContainer extends BetContainer {
    private numberOfGames: LabeledInput;
    private inputNumberOfGames: InputNumberOfGames;

    private onWinLabelInput: CustomLabelInput;
    private onLossLabelInput: CustomLabelInput;

    private labelNetGain: LabeledInput;
    private labelLoss: LabeledInput;

    private totalNetGain: number = 0;
    private totalLoss: number = 0;

    private startAutobet: Button;
    private profitMultiplierPerTime: number = 0;

    constructor(x: number, y: number) {
        super(x, y);

        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));

        // Register win listener when auto betting
        globalEmitter.on(AutoBettingEvent.ON_WIN, this.onAutoBetWin.bind(this));
        globalEmitter.on(AutoBettingEvent.ON_LOSS, this.onAutoBetLoss.bind(this));

        // Only allow start auto
        globalEmitter.on(AutoBettingEvent.PRESSED_ITEM, this.onItemPressed.bind(this));

        // Input number of games Autobet
        this.inputNumberOfGames = new InputNumberOfGames();
        this.inputNumberOfGames.onTypeRequestValueChange = this.onValueChange.bind(this);

        this.numberOfGames = new LabeledInput(
            0,
            this.selectModeGroup.y + this.selectModeGroup.height,
            350,
            50,
            'Number of Games',
            '',
            this.inputNumberOfGames
        );
        this.numberOfGames.setInputAmountText('0');

        // Input percent on win and loss
        this.onWinLabelInput = new CustomLabelInput(this.numberOfGames.x, this.numberOfGames.y + this.numberOfGames.height, 'On Win (%)', '');
        this.onLossLabelInput = new CustomLabelInput(this.onWinLabelInput.x, this.onWinLabelInput.y + this.onWinLabelInput.height, 'On Loss (%)', '');

        // Label stop on gain or loss
        let betConfig = (this.betAmount.getInputAmount() as InputBetAmount).getBetConfig();
        this.labelNetGain = new LabeledInput(this.onLossLabelInput.x, this.onLossLabelInput.y + this.onLossLabelInput.height, 500, 30, 'Stop on Net Gain', '', new CustomInputStopAuto(betConfig));
        this.labelLoss = new LabeledInput(this.labelNetGain.x, this.labelNetGain.y + this.labelNetGain.height, 500, 30, 'Stop on Loss', '', new CustomInputStopAuto(betConfig));

        // Hide auto container when start game
        this.visible = false;

        // 
        this.startAutobet = new Button({
            text: "Start Autobet",
            width: defaultButtonSize.width,
            height: defaultButtonSize.height,
            fontSize: 40,
        });

        this.resetStartAutoButton()
        this.startAutobet.anchor.set(0.5, 0.5);
        this.startAutobet.position.set(this.labelLoss.width / 2, this.labelLoss.y + this.labelLoss.height + 50);
        this.startAutobet.onPress.connect(this.onStartAutobet.bind(this));

        this.addChild(this.numberOfGames, this.onWinLabelInput, this.onLossLabelInput, this.labelNetGain, this.labelLoss, this.startAutobet);
    }

    private onItemPressed(buttonPressedCount: number) {
        if (buttonPressedCount <= 0) {
            this.resetStartAutoButton();
        } else {
            this.allowStartAutoButton();
        }
    }

    private allowStartAutoButton() {
        this.startAutobet.alpha = 1;
        this.startAutobet.interactive = true;
    }

    private onValueChange(value: string) {
        this.inputNumberOfGames.value = Number(value) > MAX_NUMBER_OF_GAMES ? String(MAX_NUMBER_OF_GAMES) : value;
    }

    private onStartAutobet() {
        const mineCount = GetNumberOfMines.getNumberOfMines(this.selectModeGroup.getCurrentMode());

        if (this.startAutobet.text === 'Start Autobet') {
            GameStateManager.getInstance().setState(GameState.BETTING);
            globalEmitter.emit(GameStateEvent.STATE_CHANGE,
                GameState.BETTING,
                mineCount,
                Number(this.numberOfGames.getInputAmount().value));

            // Calculate profit pertime
            this.profitMultiplierPerTime = mineCount / 10;

            // Reset net gain and loss value
            this.totalNetGain = 0;
            this.totalLoss = 0;
        }
        else {
            GameStateManager.getInstance().setState(GameState.NOT_BETTING);
            globalEmitter.emit(WinContainerEvent.DIASABLE);
        }
    }

    private onGameStateChange(state: GameState) {
        if (state === GameState.BETTING) {
            this.startAutobet.text = 'Stop Autobet';
        }
        else if (state === GameState.NOT_BETTING) {
            this.startAutobet.text = 'Start Autobet';
        }
    }
    private resetStartAutoButton() {
        this.startAutobet.interactive = false;
        this.startAutobet.alpha = 0.5;
    }

    private onAutoBetWin(diamondCount: number) {
        // Calculate net gain
        this.totalNetGain += Number(this.betAmount.getInputAmount().value) * (diamondCount * this.profitMultiplierPerTime);

        let profitMultiplier = 1 + diamondCount * this.profitMultiplierPerTime;
        let totalProfit = Number(this.betAmount.getInputAmount().value) * profitMultiplier;

        // Enable win container 
        globalEmitter.emit(WinContainerEvent.ENABLE, profitMultiplier, totalProfit);

        if (this.onWinLabelInput.getCurrentPercent() !== 0) {
            let currBetValue = Number(this.betAmount.getInputAmount().value);
            let percentIncrease = this.onWinLabelInput.getCurrentPercent();
            let newBetValue = currBetValue + currBetValue * (percentIncrease / 100);

            this.betAmount.getInputAmount().value = String(newBetValue.toFixed(2));
        }

        this.checkStopAutobetting();
    }

    private onAutoBetLoss() {
        // Calculate loss 
        this.totalLoss += Number(this.betAmount.getInputAmount().value);

        if (this.onLossLabelInput.getCurrentPercent() !== 0) {
            let currBetValue = Number(this.betAmount.getInputAmount().value);
            let percentIncrease = this.onLossLabelInput.getCurrentPercent();
            let newBetValue = currBetValue + currBetValue * (percentIncrease / 100);

            this.betAmount.getInputAmount().value = String(newBetValue.toFixed(2));
        }

        this.checkStopAutobetting();
    }

    private checkStopAutobetting() {
        let stop = false;

        const stopOnNetGain = Number(this.labelNetGain.getInputAmount().value) || 0;
        const stopOnLoss = Number(this.labelLoss.getInputAmount().value) || 0;

        if (stopOnNetGain > 0 && this.totalNetGain >= stopOnNetGain)
            stop = true;

        if (stopOnLoss > 0 && this.totalLoss >= stopOnLoss)
            stop = true;

        // Stop immediately
        if (stop) {
            GameStateManager.getInstance().setState(GameState.NOT_BETTING);
            globalEmitter.emit(WinContainerEvent.DIASABLE);
        }
    }

}