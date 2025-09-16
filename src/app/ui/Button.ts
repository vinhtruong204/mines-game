import { FancyButton } from "@pixi/ui";

import { Label } from "./Label";

const defaultButtonOptions = {
  text: "",
  width: 128,
  height: 110,
  fontSize: 28,
};

type ButtonOptions = typeof defaultButtonOptions;

/**
 * The big rectangle button, with a label, idle and pressed states
 */
export class Button extends FancyButton {
  private _pressed: boolean = false;
  get pressed(): boolean {
    return this._pressed;
  }
  set pressed(value: boolean) {
    this._pressed = value;
  }

  constructor(options: Partial<ButtonOptions> = {}) {
    const opts = { ...defaultButtonOptions, ...options };

    super({
      defaultView: "tile.png",
      nineSliceSprite: [38, 50, 38, 50],
      anchor: 0,
      text: new Label({
        text: opts.text,
        style: {
          fill: 0x4a4a4a,
          align: "center",
          fontSize: opts.fontSize,
        },
      }),
      textOffset: { x: 0, y: -13 },
      defaultTextAnchor: 0.5,
      scale: 0.9,
    });

    this.width = opts.width;
    this.height = opts.height;

  }

}
