import { Container, Text } from "pixi.js";
import { GameMode, GameModeLabel } from "../../mines_ui/GameMode";
import { Button } from "../../../../app/ui/Button";

export class SelectModeManager extends Container {
    private leftLabel: Text;

    private modeButtons: Button[];
    private selectedIndex: number = 0;

    constructor() {
        super();

        this.leftLabel = new Text({
            text: 'Select mode',
            style: {
                fontFamily: 'Arial',
                fontSize: 40,
                fill: 'white',
                align: 'center'
            },
        });
        this.addChild(this.leftLabel);

        this.modeButtons = new Array(4);
        this.initButtons();
    }

    private initButtons() {
        const buttonContainer = new Container();
        for (let i = 0; i < this.modeButtons.length; i++) {
            const button = new Button({
                text: GameModeLabel[i as GameMode],
                width: 140,
                height: 100,
                fontSize: 32,
            });

            button.anchor.set(0, 0);
            button.alpha = i === this.selectedIndex ? 1 : 0.5;
            button.position.set(button.width * i, 0);

            button.onPress.connect(() => this.handleButtonPressed(i));

            buttonContainer.addChild(button);

            this.modeButtons[i] = button;
        }

        buttonContainer.position.set(0, this.leftLabel.y + this.leftLabel.height);
        this.addChild(buttonContainer);
    }

    private handleButtonPressed(index: number) {
        if (index === this.selectedIndex) return;

        // Update UI after select new mode
        this.modeButtons[this.selectedIndex].alpha = 0.5; // Old mode
        this.modeButtons[index].alpha = 1; // New mode

        // Update current index
        this.selectedIndex = index;
    }

    public setCurrentMode(gameMode: GameMode) {
        if ((gameMode as number) === this.selectedIndex) return;

        this.modeButtons[this.selectedIndex].alpha = 0.5; // Old mode
        this.modeButtons[gameMode].alpha = 1; // New mode

        this.selectedIndex = gameMode;
    }

    public getCurrentMode(): GameMode {
        return this.selectedIndex as GameMode;
    }
}