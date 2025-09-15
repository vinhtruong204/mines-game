import { setEngine } from "./app/getEngine";
import { MainGameScreen } from "./custom/game_screen/MainGameScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
import { Spine } from "@esotericsoftware/spine-pixi-v8";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#1E1E1E",
    resizeOptions: { minWidth: 720, minHeight: 1280, letterbox: false },
  });

  // Initialize the user settings
  userSettings.init();

  // Show the load screen
  // await engine.navigation.showScreen(LoadScreen);
  // Show the main screen once the load screen is dismissed
  // await engine.navigation.showScreen(MainScreen);

  await engine.navigation.showScreen(MainGameScreen);

  const spine = Spine.from({ skeleton: 'tile.json', atlas: 'tile.atlas' });
  spine.position.set(200, 200);

  const crownAppear = spine.state.setAnimation(0, "crown-appear", false);
  crownAppear.listener = {
    complete: () => {
      spine.state.setAnimation(0, 'crown-idle', true);
    }
  }

  // Get all animation
  console.log(spine.skeleton.data.animations.map(item => item.name));
  engine.stage.addChild(spine);
})();
