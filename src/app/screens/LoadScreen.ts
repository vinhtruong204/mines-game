import { ProgressBar } from "@pixi/ui";
import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container } from "pixi.js";
import { getToken } from "../../custom/api/ApiRoute";
import { engine } from "../getEngine";
import { MainGameScreen } from "../../custom/_game/game_screen/MainGameScreen";
import { PausePopup } from "../popups/PausePopup";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["preload"];
  /** The PixiJS logo */
  // private pixiLogo: Sprite;
  /** Progress Bar */
  private progressBar: ProgressBar;

  constructor() {
    super();

    const data = getToken();

    // console.log(data);
    if (data.useMock === undefined || data.useMock) {
      setTimeout(() => {
        engine().navigation.showScreen(MainGameScreen);
      }, 2000);
    } else {
      if (data.token !== undefined && data.token !== "") {
        // console.log("token is valid");
        engine().navigation.showScreen(MainGameScreen);
      }
      else {
        // console.log("token isn't valid");
        engine().navigation.presentPopup(PausePopup);
      }
    }

    // this.progressBar = new ProgressBar({
    //   backgroundColor: "#3d3d3d",
    //   fillColor: "#e72264",
    //   radius: 100,
    //   lineWidth: 15,
    //   value: 20,
    //   backgroundAlpha: 0.5,
    //   fillAlpha: 0.8,
    //   cap: "round",
    // });

    this.progressBar = new ProgressBar({
      bg: 'slider_bg.png',
      fill: 'slider.png'
    });


    this.progressBar.x += this.progressBar.width / 2;
    this.progressBar.y += -this.progressBar.height / 2;

    this.addChild(this.progressBar);

    // this.pixiLogo = new Sprite({
    //   texture: Texture.from("logo.svg"),
    //   anchor: 0.5,
    //   scale: 0.2,
    // });
    // this.addChild(this.pixiLogo);
  }

  public onLoad(progress: number) {
    this.progressBar.progress = progress;
    // console.log(this.progressBar.progress);
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.progressBar.position.set(width * 0.5, height * 0.5);
  }

  /** Show screen with animations */
  public async show() {
    this.alpha = 1;
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
      delay: 1,
    });
  }
}
