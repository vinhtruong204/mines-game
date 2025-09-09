import { Container, Graphics } from "pixi.js";

// const scrollBarSize = {
//     width: 20,
//     height: 100
// }

export class ScrollView extends Container {

    private bg: Graphics;

    private handle: Graphics;

    constructor() {
        super();

        this.bg = new Graphics()
            .roundRect(0, 0, 20, 550, 20)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, alpha: 1, alignment: 0.5 });

        this.handle = new Graphics().roundRect(0, 0, 20, 40, 20)
            .fill({ color: 'black', alpha: 1 })
            .stroke({ color: 'gray', width: 4, alignment: 0.5 });

        this.handle.eventMode = 'static';
        this.handle.on('pointerdown', this.startDrag.bind(this));

        this.addChild(this.bg, this.handle);
    }

    private startDrag() {
        this.handle.alpha = 0.5;
        
    }
}