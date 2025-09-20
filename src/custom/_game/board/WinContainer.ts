import { Container, Graphics, Text } from "pixi.js";
import { globalEmitter } from "../../events/GlobalEmitter";
import { WinContainerEvent } from "../../events/WinContainerEvent";

const defaultWinContainerSize = {
    width: 200,
    height: 200
}

export class WinContainer extends Container {
    private winInforText: Text;

    constructor() {
        super();

        globalEmitter.on(WinContainerEvent.ENABLE, this.onWinContainerEnable.bind(this));
        globalEmitter.on(WinContainerEvent.DIASABLE, this.onWinContainerDisable.bind(this));

        const graphics = new Graphics()
            .roundRect(0, 0, defaultWinContainerSize.width, defaultWinContainerSize.height)
            .fill({ color: 'white', alpha: 0.5 })
            .stroke({ width: 10, color: 'green', alignment: 0.5, alpha: 0.5 });

        this.winInforText = new Text({
            text: '1.00x \n\n000.00',
            style: {
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 'black',
            }
        });

        this.winInforText.anchor = 0.5;
        this.winInforText.alpha = 0.75;
        this.winInforText.position.set(defaultWinContainerSize.width / 2, defaultWinContainerSize.height / 2);

        this.addChild(graphics, this.winInforText);

        // Disable when the game start
        this.visible = false;

        this.zIndex = 100;
    }

    private onWinContainerEnable(profitMultiplier: number, totalProfit: number) {
        this.winInforText.text = `${profitMultiplier.toFixed(2)}x \n\n${totalProfit.toFixed(2)}`;
        this.visible = true;
    }

    private onWinContainerDisable() {
        this.visible = false;
    }
}