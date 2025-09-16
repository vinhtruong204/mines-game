import { Sprite, Texture } from "pixi.js";

export enum TriangleType {
    UP = "Up",
    DOWN = "Down"
}

const defaultTriangleSize = { width: 30, height: 25 };

export class TriangleSprite extends Sprite {
    private triangleType: TriangleType;

    public onClicked?: (triangleType: TriangleType) => void;

    constructor(triangleType: TriangleType) {
        super({ texture: Texture.from("triangle.png") });

        this.triangleType = triangleType;

        // Flip vertically for up triangle
        if (this.triangleType == TriangleType.UP) {
            this.scale.set(1, -1);
        }

        this.setSize(defaultTriangleSize.width, defaultTriangleSize.height);

        // Allow interact
        this.eventMode = 'static';
        this.cursor = 'pointer';

        // Turn off visible
        this.visible = false;

        // Handle clicked event
        this.onpointerdown = this.onPointerDown;
    }

    private onPointerDown() {
        // console.log('smooth criminal!!!');

        // Invoke event
        this.onClicked?.(this.triangleType);
    }
}