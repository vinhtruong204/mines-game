import { Spine } from "@esotericsoftware/spine-pixi-v8";
import { ButtonContainer } from "@pixi/ui";
import { ItemType } from "../../_game/board/ItemType";

export enum TileAnimation {
    ALL_APPEAR = "all-appear",
    ALL_DISAPPEAR = "all-disappear",
    BOMB_APPEAR = "bomb-appear",
    BOMB_DISAPPEAR = "bomb-disappear",
    BOMB_EXPLODE = "bomb-explode",
    COLOR_BLUE = "color-blue",
    COLOR_PURPLE = "color-purple",
    CROWN_APPEAR = "crown-appear",
    CROWN_DISAPPEAR = "crown-disappear",
    CROWN_IDLE = "crown-idle"
}

export class Tile extends ButtonContainer {
    private _pressed: boolean = false;

    private tileSpine: Spine;
    constructor() {
        super();

        this.tileSpine = Spine.from({ skeleton: "tile.skel", atlas: "tile.atlas" });

        // console.log(this.tileSpine.skeleton.data.animations.map(item => item.name));
        this.tileSpine.state.setAnimation(0, TileAnimation.COLOR_BLUE, false);

        this.addChild(this.tileSpine);
    }

    public handleAppear() {
        this.tileSpine.state.setAnimation(1, TileAnimation.ALL_APPEAR, false);
    }

    public handleOpen(itemType: ItemType) {
        if (itemType === ItemType.DIAMOND) {
            const crownAppear = this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_APPEAR, false);
            crownAppear.listener = {
                complete: () => {
                    this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_IDLE, true);
                }
            }
        }
        else if (itemType === ItemType.MINE) {
            const bombAppear = this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_APPEAR, false);
            bombAppear.listener = {
                complete: () => {
                    let explode = this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_EXPLODE, false);
                    explode.listener = {
                        complete: () => {
                            this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_DISAPPEAR, false);
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