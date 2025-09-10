import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import { engine } from "../../../../app/getEngine";

const bgSize = {
    width: 40,
    height: 550
}

const handleSize = {
    width: 40,
    height: 60
}

export class ScrollView extends Container {
    private bg: Graphics;
    private handle: Graphics;

    private isDragging = false;

    constructor() {
        super();

        this.bg = new Graphics()
            .roundRect(0, 0, bgSize.width, bgSize.height, 20)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, alpha: 1, alignment: 0.5 });

        this.handle = new Graphics()
            .roundRect(0, 0, handleSize.width, handleSize.height, 20)
            .fill({ color: 'black', alpha: 1 })
            .stroke({ color: 'gray', width: 4, alignment: 0.5 });

        this.eventMode = 'static';
        this.handle.eventMode = 'static';

        this.handle.on('mouseover', this.onMouseOver, this);
        this.handle.on('mouseout', this.onMouseOut, this);

        this.handle.on("pointerdown", this.startDrag, this);
        this.handle.on("pointerup", this.endDrag, this);
        this.handle.on("pointerupoutside", this.endDrag, this);

        engine().stage.eventMode = 'static';

        this.addChild(this.bg, this.handle);
    }

    private onMouseOver() {
        this.handle.alpha = 0.75;
    }

    private onMouseOut() {
        this.handle.alpha = 1;
    }

    private startDrag() {
        // console.log("start drag");
        this.handle.alpha = 0.5;
        this.isDragging = true;

        // Add pointer move 
        engine().stage.on('pointermove', this.onDragMove, this);
    }

    private onDragMove(e: FederatedPointerEvent) {
        if (!this.isDragging) return;

        // Get local position in ScrollView
        const local = this.toLocal(e.global);
        // console.log(local);

        // Update position of handle
        this.handle.y = Math.min(
            Math.max(local.y - this.handle.height / 2, 0),
            this.bg.height - this.handle.height
        );

        // console.log("dragging:", this.handle.y);
    }

    private endDrag() {
        // console.log("stop drag");
        this.handle.alpha = 1;
        this.isDragging = false;

        engine().stage.off("pointermove", this.onDragMove, this);
    }
}
