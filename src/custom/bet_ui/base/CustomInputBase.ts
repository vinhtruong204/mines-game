import { Input } from "@pixi/ui";
import { Graphics, Sprite, Texture } from "pixi.js";
import { TriangleSprite, TriangleType } from "./TriangleSprite";

type ViewType = Sprite | Graphics | Texture | string;

//**This class contain a input field and two triangles to modify value */
export class CustomInputBase extends Input {
    // Two triangles
    private upTriangle: TriangleSprite;
    private downTriangle: TriangleSprite;

    public onRequestValueChange?: (triangleType: TriangleType) => void;
    public onTypeRequestValueChange?: (value: string) => void;

    constructor(bg: ViewType, placeholder: string) {
        super({
            bg: bg,
            placeholder: placeholder,
            padding: [11, 11, 11, 11],
        });

        // Handle input event
        this.onChange.connect(this.handleInputChange.bind(this));

        // Handle hover and leave event
        this.onpointerenter = this.handleOnPointerEnter.bind(this);
        this.onpointerleave = this.handleOnPointerLeave.bind(this);

        // Initial triangle
        this.upTriangle = new TriangleSprite(TriangleType.UP);
        this.downTriangle = new TriangleSprite(TriangleType.DOWN);

        // Adjust position of two triangles
        this.upTriangle.position.set(this.width - this.upTriangle.width, this.height / 2 - 1);
        this.downTriangle.position.set(this.width - this.downTriangle.width, this.height / 2 + 1);

        // Handle triangle pointer down event 
        this.upTriangle.onClicked = this.onTriangleClicked.bind(this);
        this.downTriangle.onClicked = this.onTriangleClicked.bind(this);

        this.addChild(this.upTriangle, this.downTriangle);
    }

    private handleInputChange(text: string) {
        const cleaned = text.replace(/\D/g, "");
        if (cleaned !== text) this.value = cleaned;
        this.onTypeRequestValueChange?.(this.value);
    }

    private handleOnPointerEnter() {
        this.updateTriangleVisible(true);
    }

    private handleOnPointerLeave() {
        this.updateTriangleVisible(false);
    }

    private updateTriangleVisible(value: boolean) {
        this.upTriangle.visible = value;
        this.downTriangle.visible = value;
    }

    private onTriangleClicked(triangleType: TriangleType) {
        // console.log(triangleType);

        this.onRequestValueChange?.(triangleType);
    }
}