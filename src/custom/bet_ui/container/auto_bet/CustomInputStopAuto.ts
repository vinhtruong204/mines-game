import { Graphics } from "pixi.js";
import { CustomInputBase } from "../../base/CustomInputBase"
import { TriangleType } from "../../base/TriangleSprite";

const defaultInputFieldSize = {
    width: 500,
    height: 50
}

function getInputFieldBg() {
    return new Graphics()
        .rect(0, 0, defaultInputFieldSize.width, defaultInputFieldSize.height)
        .fill({ color: 'white', alpha: 1 })
        .stroke({ width: 4, color: 'gray', alpha: 1, alignment: 0.5 });
}

export class CustomInputStopAuto extends CustomInputBase {
    private betCofig: number[];
    private currentIndex: number = 0;

    constructor(betConfig: number[]) {
        super(getInputFieldBg(), '0.00');

        this.betCofig = betConfig;

        this.onRequestValueChange = this.onValueChange?.bind(this);
        this.onTypeRequestValueChange = this.onTypeValueChange.bind(this);
    }

    private onValueChange(triangleType: TriangleType) {
        if (triangleType === TriangleType.UP)
            this.currentIndex = this.currentIndex + 1 >= this.betCofig.length
                ? this.betCofig.length - 1
                : ++this.currentIndex;
        else
            this.currentIndex = this.currentIndex - 1 < 0 ? 0 : --this.currentIndex;
        
        this.updateValue(this.betCofig[this.currentIndex]);
    }

    private onTypeValueChange(value: string) {
        let currValue = Number(value);

        // Limit the max value
        this.value = String(Math.min(currValue, this.maxVal));
    }

    private updateValue(newValue: number) {
        this.value = String(newValue.toFixed(2));
    }

    private get maxVal(): number {
        return this.betCofig[this.betCofig.length - 1];
    }
}