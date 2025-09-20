import { Container, Sprite, Ticker } from "pixi.js";
import { UIManager } from "../../ui/manager_ui/UIManager";
import { BoardContainer } from "../board/BoardContainer";
import { engine } from "../../../app/getEngine";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { SettingsPopup } from "../../../app/popups/SettingsPopup";
import { GameMode } from "../../ui/bet_ui/mines_ui/GameMode";
import { BackgroundAnimation } from "./BackgroundAnimation";

const safeZoneSize = {
    width: 720,
    height: 140
};

const boardOffsetY = 424;

const bgSpineOffset = {
    x: 360,
    y: 780
};

const uiManagerOffsetX = 50;

export class MainGameScreen extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["default"];

    private paused = false;
    private bg: Sprite;
    private bgSpine: Spine;

    // Board container
    private boardContainer: BoardContainer;

    // UI Manager
    private uiManager: UIManager;
    private firstTime: boolean = false;

    constructor() {
        super();

        this.boardContainer = new BoardContainer();

        this.bg = Sprite.from(`bg.jpg`);
        this.bgSpine = Spine.from({ skeleton: "bg.skel", atlas: "bg.atlas" });
        this.bgSpine.state.setAnimation(0, BackgroundAnimation.LEVEL_1, true);
        // this.bgSpine.blendMode = "normal";
        // this.bgSpine.autoUpdate = true;

        // console.log(this.bgSpine.skeleton.data.animations);

        // const button = new Button({
        //     text: 'Show Popup',
        //     fontSize: 40,
        //     width: 300,
        //     height: 100
        // });

        // button.onPress.connect(this.showPopup);

        this.uiManager = new UIManager();
        this.uiManager.gameModeChange = this.onGameModeChange.bind(this);

        this.addChild(this.bg, this.bgSpine, this.boardContainer, this.uiManager);

    }

    private onGameModeChange(gameMode: GameMode) {
        switch (gameMode) {
            case GameMode.EASY:
                this.bgSpine.state.setEmptyAnimation(1, 0.25);
                this.bgSpine.state.setEmptyAnimation(2, 0.25);
                this.bgSpine.state.setEmptyAnimation(3, 0.25);
                this.bgSpine.state.setAnimation(0, BackgroundAnimation.LEVEL_1, true);
                break;

            case GameMode.MEDIUM:
                this.bgSpine.state.setEmptyAnimation(2, 0.25);
                this.bgSpine.state.setEmptyAnimation(3, 0.25);
                this.bgSpine.state.setAnimation(0, BackgroundAnimation.LEVEL_1, true);
                this.bgSpine.state.setAnimation(1, BackgroundAnimation.LEVEL_2, true);
                break;

            case GameMode.HARD:
                // this.bgSpine.state.clearTrack(3);
                this.bgSpine.state.setEmptyAnimation(3, 0.25);
                this.bgSpine.state.setAnimation(0, BackgroundAnimation.LEVEL_1, true);
                this.bgSpine.state.setAnimation(1, BackgroundAnimation.LEVEL_2, true);
                this.bgSpine.state.setAnimation(2, BackgroundAnimation.LEVEL_3, true);
                break;

            case GameMode.EXTREME:
                this.bgSpine.state.setAnimation(0, BackgroundAnimation.LEVEL_1, true);
                this.bgSpine.state.setAnimation(1, BackgroundAnimation.LEVEL_2, true);
                this.bgSpine.state.setAnimation(2, BackgroundAnimation.LEVEL_3, true);
                this.bgSpine.state.setAnimation(3, BackgroundAnimation.LEVEL_4, true);
                break;

            default:
                break;
        }
    }


    private showPopup() {
        // console.log("show popup");
        engine().navigation.presentPopup(SettingsPopup);
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
        const centerX = (width - this.bg.width) * 0.5;
        const centerY = (height - this.boardContainer.height) * 0.5;
        this.bgSpine.position.y = centerY;

        // Center the board when window size change
        this.boardContainer.position.set(centerX + 50, boardOffsetY - safeZoneSize.height);

        // const uiManagerOffsetX = (this.boardContainer.width - this.uiManager.width) / 2;
        if (!this.firstTime) {
            this.uiManager.position.set(centerX + (this.bg.width - this.uiManager.width) * 0.5, this.boardContainer.y + this.boardContainer.height + 108); // board_height: 548, board_height: 440(the first time open)
            this.firstTime = true;
        }
        else {
            this.uiManager.position.set(centerX + (this.bg.width - this.uiManager.width) * 0.5, this.boardContainer.y + this.boardContainer.height);
        }

        this.bg.position.set(centerX, -safeZoneSize.height);
        this.bgSpine.position.set(this.bg.position.x + bgSpineOffset.x, this.bg.position.y + bgSpineOffset.y);

    }

    /** Show screen with animations */
    public async show(): Promise<void> {
        // engine().audio.bgm.play("main/sounds/bgm-main.mp3", { volume: 0.5 });

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