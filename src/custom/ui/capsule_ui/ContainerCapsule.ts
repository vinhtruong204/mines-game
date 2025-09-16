import { Container, Graphics } from "pixi.js";
import { ChildCapsule } from "./ChildCapsule";
import { CapsuleType } from "./CapsuleType";
import { GameStateEvent } from "../../events/game_states/GameStateEvent";
import { globalEmitter } from "../../events/GlobalEmitter";
import { GameState } from "../../manage_game_states/GameState";

export class ContainerCapsule extends Container {
    private capsuleWidth = 500;
    private capsuleHeight = 70;
    private cornerRadius = this.capsuleHeight / 2;

    private rectContainer: Graphics;

    private leftChild: ChildCapsule;
    private rightChild: ChildCapsule;

    private selectedChild: ChildCapsule | null = null;

    public onUIChange?: (capsuleType: CapsuleType | null) => void;

    constructor(x: number, y: number) {
        super({ x: x, y: y });

        globalEmitter.on(GameStateEvent.STATE_CHANGE, this.onGameStateChange.bind(this));

        this.width = this.capsuleWidth;
        this.height = this.capsuleHeight;

        this.rectContainer = new Graphics()
            .roundRect(0, 0, this.capsuleWidth, this.capsuleHeight, this.cornerRadius)
            .fill({ color: 'gray', alpha: 1 })
            .stroke({ width: 5, color: 'white', alignment: 1 });

        // Left child (Manual)
        this.leftChild = new ChildCapsule(0, 0, this.capsuleWidth / 2, this.capsuleHeight, CapsuleType.MANUAL);

        // Right child (Auto)
        this.rightChild = new ChildCapsule(
            this.leftChild.x + this.leftChild.width,
            0,
            this.capsuleWidth / 2,
            this.capsuleHeight,
            CapsuleType.AUTO)

        // Register call back
        this.leftChild.onSelected = (capsule) => this.handleSelection(capsule);
        this.rightChild.onSelected = (capsule) => this.handleSelection(capsule);

        // Add to the container
        this.addChild(this.rectContainer, this.leftChild, this.rightChild);

        // Choose manual first
        this.handleSelection(this.leftChild);

        this.zIndex = 10;

    }

    private handleSelection(capsule: ChildCapsule) {
        // Reset selected boolean
        if (this.selectedChild && this.selectedChild !== capsule) {
            this.selectedChild.setSelected(false);
        }

        // Update selected child
        this.selectedChild = capsule;
        this.selectedChild.setSelected(true);

        // Raise event
        this.onUIChange?.(this.getSelectedType());
    }

    public getSelectedType(): CapsuleType | null {
        return this.selectedChild ? this.selectedChild.getCapsuleType() : null;
    }

    private onGameStateChange(state: GameState) {
        if (state === GameState.BETTING) {
            this.interactive = false;
            this.interactiveChildren = false;
        } else if (state === GameState.NOT_BETTING) {
            this.interactive = true;
            this.interactiveChildren = true;
        }
    }
}