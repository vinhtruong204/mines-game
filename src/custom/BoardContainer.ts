import { Container } from "pixi.js";
import { GlobalConfig } from "./config/GlobalConfig";
import { FancyButton } from "@pixi/ui";

export class BoardContainer extends Container {

    constructor() {
        super();

        this.initBoard();

    }

    private initBoard() {
        const buttonAnimation = {
            hover: {
                props: {
                    scale: {
                        x: 1.05,
                        y: 1.05,
                    }
                },
                duration: 100,
            },
            pressed: {
                props: {
                    scale: {
                        x: 0.95,
                        y: 0.95,
                    }
                },
                duration: 100,
            }
        };

        const buttonSize = 720 / GlobalConfig.TOTAL_COLUMNS;

        for (let i = 0; i < GlobalConfig.TOTAL_ROWS; i++) {
            for (let j = 0; j < GlobalConfig.TOTAL_COLUMNS; j++) {
                const button = new FancyButton({
                    defaultView: `button.png`,
                    animations: buttonAnimation,
                });

                button.setSize(buttonSize, buttonSize);
                button.position.set(j * buttonSize , i * buttonSize);

                this.addChild(button);
            }
        }
    }
}