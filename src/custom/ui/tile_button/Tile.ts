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
    private itemType: ItemType = ItemType.DIAMOND;
    private _pressed: boolean = false;

    private tileSpine: Spine;
    constructor() {
        super();

        this.tileSpine = Spine.from({ skeleton: "tile.skel", atlas: "tile.atlas" });

        this.tileSpine.state.data.setMix(TileAnimation.COLOR_BLUE, TileAnimation.COLOR_PURPLE, 0.25);
        this.tileSpine.state.data.setMix(TileAnimation.COLOR_PURPLE, TileAnimation.COLOR_BLUE, 0.25);

        // console.log(this.tileSpine.skeleton.data.animations.map(item => item.name));
        this.tileSpine.state.setAnimation(0, TileAnimation.COLOR_BLUE, false);

        this.addChild(this.tileSpine);
    }

    public handleAppear() {
        this.tileSpine.state.setAnimation(1, TileAnimation.ALL_APPEAR, false);
        // this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_DISAPPEAR, false);
        // this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_EXPLODE, false);
    }

    public handleDisAppear() {
        switch (this.itemType) {
            case ItemType.DIAMOND:
                this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_DISAPPEAR, false);
                break;
            case ItemType.MINE:
                this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_DISAPPEAR, false);
                break;
            default:
                break;
        }
    }

    public handleOpen(itemType: ItemType) {
        this.itemType = itemType;

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

    public handleSwitchMode(isAuto: boolean) {
        if (!isAuto) {
            this.tileSpine.state.setAnimation(0, TileAnimation.COLOR_BLUE, false);
            // this.tileSpine.state.addAnimation(0, TileAnimation.COLOR_BLUE, false, 0);

        }
        else {
            this.tileSpine.state.setAnimation(0, TileAnimation.COLOR_PURPLE, false);
            // this.tileSpine.state.addAnimation(0, TileAnimation.COLOR_PURPLE, false, 0);
        }

    }

    get pressed(): boolean {
        return this._pressed;
    }

    set pressed(value: boolean) {
        this._pressed = value;
    }
}