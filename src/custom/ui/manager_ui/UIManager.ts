import { Container } from "pixi.js";
import { ContainerCapsule } from "../capsule_ui/ContainerCapsule";
import { ManualBetContainer } from "../bet_ui/container/manual_bet/ManualBetContainer";
import { AutoBetContainer } from "../bet_ui/container/auto_bet/AutoBetContainer";
import { CapsuleType } from "../capsule_ui/CapsuleType";
import { globalEmitter } from "../../events/GlobalEmitter";
import { GameModeChangeEvent } from "../../events/game_mode_events/GameModeChangeEvent";
import { WinContainerEvent } from "../../events/WinContainerEvent";
import { GameMode } from "../bet_ui/mines_ui/GameMode";

//**This class will manage visible of two types UI (Manual and Auto) */
export class UIManager extends Container {
    private containerCapsule: ContainerCapsule;
    private manualBetContainer: ManualBetContainer;
    private autoBetContainer: AutoBetContainer;

    public gameModeChange?: (gameMode: GameMode) => void;

    constructor() {
        super();

        this.containerCapsule = new ContainerCapsule(0, 0);

        // Register handle event callback
        this.containerCapsule.onUIChange = this.handleUIChange.bind(this);

        this.manualBetContainer = new ManualBetContainer(
            this.containerCapsule.x,
            this.containerCapsule.y + this.containerCapsule.height
        );
        this.manualBetContainer.gameModeChange = this.onGameModeChange.bind(this);

        this.autoBetContainer = new AutoBetContainer(
            this.containerCapsule.x,
            this.containerCapsule.y + this.containerCapsule.height
        );
        this.autoBetContainer.gameModeChange = this.onGameModeChange.bind(this);

        this.addChild(this.containerCapsule, this.manualBetContainer, this.autoBetContainer);
    }

    private onGameModeChange(gameMode: GameMode) {
        this.gameModeChange?.(gameMode);
    }

    private handleUIChange(capsuleType: CapsuleType | null) {
        // console.log('UI change');
        if (capsuleType === CapsuleType.AUTO) {
            this.autoBetContainer.visible = true;
            this.manualBetContainer.visible = false;

            // Update state
            this.autoBetContainer.setBetState(this.manualBetContainer.getBetState());

            // Raise start auto event to the board
            globalEmitter.emit(GameModeChangeEvent.AUTO);

            // Raise event to disable win container
            globalEmitter.emit(WinContainerEvent.DIASABLE);
        }
        else if (capsuleType === CapsuleType.MANUAL) {
            this.autoBetContainer.visible = false;
            this.manualBetContainer.visible = true;

            // Update state
            this.manualBetContainer.setBetState(this.autoBetContainer.getBetState());

            // Raise start auto event to the board
            globalEmitter.emit(GameModeChangeEvent.MANUAL);
        }
    }
}