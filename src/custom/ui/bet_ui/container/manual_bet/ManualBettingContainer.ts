import { Container, FederatedPointerEvent, FederatedWheelEvent, Graphics, Rectangle } from "pixi.js";
import { CustomInputBase } from "../../base/CustomInputBase";
import { LabeledInput } from "../../base/LabeledInput";
import { Button } from "../../../../../app/ui/Button";
import { ItemType } from "../../../../_game/board/ItemType";
import { globalEmitter } from "../../../../events/GlobalEmitter";
import { ManualBettingEvent } from "../../../../events/manual_betting_events/ManualBettingEvent";
import { engine } from "../../../../../app/getEngine";

const defaultInputFieldSize = {
    width: 350,
    height: 50
}

const defaultButtonSize = {
    width: 50,
    height: 50
}

const scrollHeight = 300;

export class ManualBettingContainer extends Container {
    private minesCount: LabeledInput;
    private diamondRemain: LabeledInput;

    private totalProfit: LabeledInput;

    private randomPickButton: Button;
    private cashoutButton: Button;

    public onBettingCompleted?: () => void;

    // Handle event draging
    private isDragging: boolean = false;

    constructor(x: number, y: number) {
        super({ x: x, y: y });

        globalEmitter.on(ManualBettingEvent.PRESSED_ITEM, this.onItemPressed.bind(this));

        this.minesCount = new LabeledInput(
            0,
            0,
            defaultInputFieldSize.width,
            defaultInputFieldSize.height,
            'Mines',
            '',
            this.getInputCanNotInteract());

        this.diamondRemain = new LabeledInput(
            this.minesCount.x + this.minesCount.width,
            0,
            defaultInputFieldSize.width,
            defaultInputFieldSize.height,
            'Diamonds',
            '',
            this.getInputCanNotInteract());

        // this.minesCount.setInputAmountText('8');
        this.totalProfit = new LabeledInput(
            this.minesCount.x,
            this.minesCount.y + this.minesCount.height + 20,
            defaultInputFieldSize.width * 2,
            defaultInputFieldSize.height,
            'Total profit (1.00x)',
            '0.00US$',
            this.getInputCanNotInteract(true));

        // Random button
        this.randomPickButton = new Button({
            text: 'Random Pick',
            width: this.totalProfit.width,
            height: this.totalProfit.height,
            fontSize: 40
        });
        this.randomPickButton.anchor.set(0, 0);
        this.randomPickButton.position.set(this.totalProfit.x, this.totalProfit.y + this.totalProfit.height + 20);
        this.randomPickButton.onPress.connect(this.onRandomPickClicked.bind(this));

        // Withdraw button
        this.cashoutButton = new Button({
            text: 'Cashout',
            width: this.totalProfit.width,
            height: this.totalProfit.height,
            fontSize: 40
        });
        this.cashoutButton.anchor.set(0, 0);
        this.cashoutButton.position.set(this.randomPickButton.x, this.randomPickButton.y + this.randomPickButton.height + 20);
        this.cashoutButton.onPress.connect(this.handleWithdrawButtonClicked.bind(this));
        this.cashoutButton.visible = false;

        // Disable for the first time
        this.cashoutButton.alpha = 0.5;
        this.cashoutButton.interactive = false;

        this.addChild(this.minesCount, this.diamondRemain, this.totalProfit, this.randomPickButton, this.cashoutButton);

        // Disable when the game start
        this.visible = false;

        // Handle event scroll
        this.eventMode = 'static';
        engine().stage.eventMode = 'static';
        this.hitArea = new Rectangle(0, 0, this.width, this.height);

        this.on("pointerdown", this.startDrag, this);
        this.on("pointerup", this.endDrag, this);
        this.on("pointerupoutside", this.endDrag, this);

        this.on('wheel', this.onWheel, this);
    }

    private onWheel(event: FederatedWheelEvent) {
        // Access scroll delta information
        // console.log('Vertical scroll:', event.deltaY);
        this.updateUIVisibility(-event.deltaY / 5);
    }

    private dragStartY: number = 0;
    private startDrag(e: FederatedPointerEvent) {
        // console.log("start drag");
        this.isDragging = true;
        this.dragStartY = e.global.y;

        engine().stage.on("pointermove", this.onDragMove, this);
    }

    private onDragMove(e: FederatedPointerEvent) {
        if (!this.isDragging) return;

        const deltaY = e.global.y - this.dragStartY;
        this.dragStartY = e.global.y;

        this.updateUIVisibility(deltaY);
    }

    private endDrag() {
        // console.log("end drag");
        this.isDragging = false;
        engine().stage.off("pointermove", this.onDragMove, this);
    }

    private canScrollDown: boolean = false;
    private canScrollUp: boolean = true;
    private updateUIVisibility(deltaY: number) {
        // Calm y value of bet amount
        // if (this.betAmount.y <= 0) this.betAmount.y = 0;

        // console.log(deltaY);
        // Can't scroll down
        if (deltaY > 0 && !this.canScrollDown) {
            // console.log('Can not scroll down');
            return;

        }

        // Can't scroll up
        if (deltaY < 0 && !this.canScrollUp) {
            // console.log('Can not scroll up'); 
            return;
        }

        for (const child of this.children) {
            child.position.y += deltaY;
            if (child.y < 0 || child.y + child.height >= scrollHeight) {
                child.visible = false;
            } else {
                child.visible = true;
            }
        }

        // console.log(this.betAmount.visible);
        if (this.minesCount.visible == true) this.canScrollDown = false;
        else this.canScrollDown = true;

        if (this.cashoutButton.visible == true) this.canScrollUp = false;
        else this.canScrollUp = true;
    }

    private onItemPressed(itemType: ItemType) {
        if (itemType === ItemType.CROWN) {
            this.cashoutButton.alpha = 1;
            this.cashoutButton.interactive = true;
        }
        else if (itemType === ItemType.BOMB) {
            this.cashoutButton.alpha = 0.5;
            this.cashoutButton.interactive = false;
        }
    }

    private getBackgroundOfInput(isFullWidth: boolean) {
        const width = isFullWidth ? defaultInputFieldSize.width + defaultButtonSize.width * 3 : defaultInputFieldSize.width - defaultButtonSize.width * 2;
        return new Graphics()
            .rect(0, 0, width, defaultInputFieldSize.height)
            .fill({ color: 'white', alpha: 1 })
            .stroke({ width: 4, color: 'gray', alpha: 1, alignment: 0.5 });
    }

    private getInputCanNotInteract(isFullWidth: boolean = false) {
        const customInputBase = new CustomInputBase(this.getBackgroundOfInput(isFullWidth), '');
        customInputBase.interactive = false;
        return customInputBase;
    }

    public setGameConfig(minesCount: number | null, diamondRemain: number, totalProfit: number, profitMultiplier: number = 0) {
        this.minesCount.setInputAmountText(String(minesCount ? minesCount : this.minesCount.getInputAmount().value));
        this.diamondRemain.setInputAmountText(String(diamondRemain));
        this.totalProfit.setInputAmountText(String(totalProfit.toFixed(2)));

        // Update or reset total profit text
        if (profitMultiplier !== 0) this.totalProfit.setLeftLabelText(`Total profit (${profitMultiplier.toFixed(2)}x)`);
        else this.totalProfit.setLeftLabelText('Total profit (1.00x)');
    }

    private handleWithdrawButtonClicked() {
        // Container betting progress notice completed
        this.onBettingCompleted?.();

        // Disable cashout button when betting is completed
        this.cashoutButton.alpha = 0.5;
        this.cashoutButton.interactive = false;
    }

    private onRandomPickClicked() {
        // Raise event when random button clicked
        globalEmitter.emit(ManualBettingEvent.PICK_RANDOM);
    }
}