import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { ButtonContainer } from "@pixi/ui";
import { ItemType } from "../../_game/board/ItemType";

export class Tile extends ButtonContainer {
    private _pressed: boolean = false;

    private tileSpine: Spine;
    constructor() {
        super();

        this.tileSpine = Spine.from({ skeleton: "tile.skel", atlas: "tile.atlas" });

        // console.log(this.tileSpine.skeleton.data.animations.map(item => item.name));
        this.tileSpine.state.setAnimation(0, "color-blue", false);

        this.addChild(this.tileSpine);
    }

    public handleAppear() {
        this.tileSpine.state.setAnimation(1, "all-appear", false);
    }

    public handleOpen(itemType: ItemType) {
        if (itemType === ItemType.DIAMOND) {
            const crownAppear = this.tileSpine.state.setAnimation(1, "crown-appear", false);
            crownAppear.listener = {
                complete: () => {
                    this.tileSpine.state.setAnimation(1, "crown-idle", true);
                }
            }
        }
        else if (itemType === ItemType.MINE) {
            const bombAppear = this.tileSpine.state.setAnimation(1, "bomb-appear", false);
            bombAppear.listener = {
                complete: () => {
                    let explode = this.tileSpine.state.setAnimation(1, "bomb-explode", false);
                    explode.listener = {
                        complete: () => {
                            this.tileSpine.state.setAnimation(1, "bomb-disappear", false);
                        }
                    }
                }
            }
        }
    }

    get pressed(): boolean {
        return this._pressed;
    }

    set pressed(value: boolean) {
        this._pressed = value;
    }
}