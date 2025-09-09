import { Container, Ticker } from "pixi.js";
import { engine } from "../../app/getEngine";
import { UIManager } from "../manager_ui/UIManager";
import { BoardContainer } from "../_game/board/BoardContainer";

export class MainGameScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["main"];

    private paused = false;

    // Board container
    private boardContainer: BoardContainer;

    // UI Manager
    private uiManager: UIManager;

    constructor() {
        super();

        this.boardContainer = new BoardContainer();

        // this.uiManager = new UIManager(this.boardContainer.x, this.boardContainer.y + this.boardContainer.height);
        this.uiManager = new UIManager();

        this.addChild(this.boardContainer, this.uiManager);
    }


    /** Prepare the screen just before showing */
    public prepare() { }

    /** Update the screen */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public update(_time: Ticker) {
        if (this.paused) return;
    }

    /** Pause gameplay - automatically fired when a popup is presented */
    public async pause() {
        this.interactiveChildren = false;
        this.paused = true;
    }

    /** Resume gameplay */
    public async resume() {
        this.interactiveChildren = true;
        this.paused = false;
    }

    /** Fully reset */
    public reset() { }

    /** Resize the screen, fired whenever window size changes */
    public resize(width: number, height: number) {
        const centerX = (width - this.boardContainer.width) * 0.5;
        const centerY = (height - this.boardContainer.height) * 0.5;

        // Center the board when window size change
        this.boardContainer.position.set(centerX, 30);

        const uiManagerOffsetX = (this.boardContainer.width - this.uiManager.width) / 2;
        this.uiManager.position.set(centerX + uiManagerOffsetX, this.boardContainer.y + this.boardContainer.height);
    }

    /** Show screen with animations */
    public async show(): Promise<void> {
        engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

        // const elementsToAnimate = [
        //   this.settingsButton,
        // ];

        // let finalPromise!: AnimationPlaybackControls;
        // for (const element of elementsToAnimate) {
        //   element.alpha = 0;
        //   finalPromise = animate(
        //     element,
        //     { alpha: 1 },
        //     { duration: 0.3, delay: 0.75, ease: "backOut" },
        //   );
        // }

        // await finalPromise;
    }

    /** Hide screen with animations */
    public async hide() { }

    /** Auto pause the app when window go out of focus */
    public blur() {
        if (!engine().navigation.currentPopup) {
            // engine().navigation.presentPopup(PausePopup);
        }
    }
}