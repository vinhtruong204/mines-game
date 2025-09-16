import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { ButtonContainer } from "@pixi/ui";

export class Tile extends ButtonContainer {
    private tileSpine: Spine;
    constructor() {
        super();

        this.tileSpine = Spine.from({ skeleton: "tile.skel", atlas: "tile.atlas" });

        this.addChild(this.tileSpine);
    }
}