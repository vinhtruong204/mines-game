import { Container, Graphics, Text } from "pixi.js";
import { CapsuleType } from "./CapsuleType";

export class ChildCapsule extends Container {
    private selected: boolean = false;
    private hover: boolean = false;

    // UI
    private capsule: Graphics;
    private textUI: Text;

    // Type of child capsule
    private capsuleType: CapsuleType;

    // Callback
    public onSelected?: (capsule: ChildCapsule) => void;

    constructor(x: number, y: number, width: number, height: number, capsuleType: CapsuleType) {
        super({ x: x, y: y, width: width, height: height });

        this.capsuleType = capsuleType;

        this.alpha = 0.5;

        this.capsule = new Graphics()
            .roundRect(0, 0, width, height, height / 2)
            .fill({ color: 'green', alpha: 1 })
            .stroke({ width: 5, color: 'white', alignment: 0.5 });

        this.textUI = new Text({
            text: this.capsuleType,
            style: {
                fontSize: 32,
                fontFamily: "Arial",
                align: 'center',
                fill: '0x000000'
            }
        });
        this.textUI.anchor = 0.5;
        this.textUI.position.set(width / 2, height / 2);

        this.addChild(this.capsule, this.textUI);

        // Change UI when hover and allow interact
        this.cursor = 'pointer';
        this.eventMode = 'static';

        // Handle event
        this.onpointerdown = this.handleOnDown;
        this.onpointerenter = this.handleOnEnter;
        this.onpointerleave = this.handleOnLeave;
    }

    private handleOnDown() {
        if (this.selected) return;

        // console.log("clicked");
        this.selected = true;

        this.onSelected?.(this);

        this.updateVisuals();
    }

    private handleOnEnter() {
        // console.log("enter");
        this.hover = true;
        this.updateVisuals();
    };

    private handleOnLeave() {
        // console.log("leave");

        this.hover = false;
        this.updateVisuals();
    };

    private updateVisuals() {
        if (this.selected) {
            this.alpha = 1;
        }
        else if (this.hover) {
            this.alpha = 0.75;
        }
        else {
            this.alpha = 0.5;
        }
    }

    public setSelected(value: boolean) {
        this.selected = value;
        this.updateVisuals();
    }

    public getCapsuleType(): CapsuleType {
        return this.capsuleType;
    }

}