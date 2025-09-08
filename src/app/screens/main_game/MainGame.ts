import { Container, Text, Ticker } from "pixi.js";
import { engine } from "../../getEngine";

export class MainGame extends Container {
    /** Assets bundles required by this screen */
    public static assetBundles = ["main"];

    private paused = false;

    constructor() {
        super();

        const wrappedText = new Text({
            text: 'This is a long piece of text that will automatically wrap to multiple lines',
            style: {
                fontSize: 20,
                wordWrap: true,
                wordWrapWidth: 200,
                lineHeight: 30,
                fill: 'white'
            }
        });

        wrappedText.position.set(0, 0);

        this.addChild(wrappedText);
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
        const centerX = width * 0.5;
        const centerY = height * 0.5;

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