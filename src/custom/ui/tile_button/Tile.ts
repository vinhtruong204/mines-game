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
    private _canPress: boolean = false;
    private _pressed: boolean = false;

    private tileSpine: Spine;
    constructor() {
        super();

        this.tileSpine = Spine.from({ skeleton: "tile.skel", atlas: "tile.atlas" });
        this.tileSpine.state.setAnimation(0, TileAnimation.COLOR_BLUE, true);

        // this.tileSpine.state.data.setMix(TileAnimation.COLOR_BLUE, TileAnimation.COLOR_PURPLE, 0.25);
        // this.tileSpine.state.data.setMix(TileAnimation.COLOR_PURPLE, TileAnimation.COLOR_BLUE, 0.25);


        // console.log(this.tileSpine.skeleton.data.animations.map(item => item.name));
        // console.log(this.tileSpine.skeleton.data.animations);
        // this.tileSpine.blendMode = BlendMode.Normal;
        // this.tileSpine.autoUpdate = true;


        this.addChild(this.tileSpine);
    }

    public handleAppear() {
        const appear = this.tileSpine.state.setAnimation(1, TileAnimation.ALL_APPEAR, false);
        appear.listener = {
            start: () => this._canPress = false,
            complete: () => this._canPress = true,
            interrupt: () => this._canPress = true
        }
        // this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_DISAPPEAR, false);
        // this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_EXPLODE, false);
    }

    public handleDisAppear(itemType: ItemType) {
        let currentAnimation = this.tileSpine.state.getCurrent(1)?.animation?.name;

        if ([TileAnimation.ALL_APPEAR, TileAnimation.CROWN_DISAPPEAR, TileAnimation.BOMB_DISAPPEAR]
            .includes(currentAnimation as TileAnimation)) {
            return;
        }

        switch (itemType) {
            case ItemType.CROWN:
                const disappearCrown = this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_DISAPPEAR, false);
                disappearCrown.listener = {
                    start: () => this._canPress = false,
                    end: () => this._canPress = true,
                    interrupt: () => this._canPress = true
                }
                break;
            case ItemType.BOMB:
                const disappearBomb = this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_DISAPPEAR, false);
                disappearBomb.listener = {
                    start: () => this._canPress = false,
                    end: () => this._canPress = true,
                    interrupt: () => this._canPress = true
                }
                break;
            default:
                break;
        }
    }

    public handleOpen(itemType: ItemType) {

        if (itemType === ItemType.CROWN) {
            const crownAppear = this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_APPEAR, false);
            crownAppear.listener = {
                complete: () => {
                    this.tileSpine.state.setAnimation(1, TileAnimation.CROWN_IDLE, true);
                }
            }
        }
        else if (itemType === ItemType.BOMB) {
            const bombAppear = this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_APPEAR, false);
            bombAppear.listener = {
                complete: () => {
                    let explode = this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_EXPLODE, false);
                    explode.listener = {
                        // complete: () => {
                        //     this.tileSpine.state.setAnimation(1, TileAnimation.BOMB_DISAPPEAR, false);
                        // }
                    }

                }
            }
        }
    }

    public handleSwitchMode(isAuto: boolean) {
        // this.tileSpine.skeleton.setToSetupPose();

        this.tileSpine.state.setEmptyAnimation(0, 0.1);

        this.tileSpine.state.addAnimation(0, isAuto ? TileAnimation.COLOR_PURPLE : TileAnimation.COLOR_BLUE, false, 0).mixDuration = 0.15;
    }

    get pressed(): boolean {
        return this._pressed;
    }

    set pressed(value: boolean) {
        this._pressed = value;
    }

    get canPress(): boolean {
        return this._canPress;
    }

}