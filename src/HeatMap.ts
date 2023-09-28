import ZOrderCurve from "./zOrderCurve";

export type HeatMapPixel = { x: number; y: number; value: number };

export interface IHeatMap {
  getMaxObservedValue(): number;
  getMinObservedValue(): number;
  getWidth(): number;
  getHeight(): number;
  getMaxValue(): number;
  getMinValue(): number;

  setValueAt(x: number, y: number, value: number, radius: number): void;
  addValueAt(x: number, y: number, adjustment: number, radius: number): void;
  getValueAt(x: number, y: number): void;
  update(deltaTime: number): void;

  getPixels(): HeatMapPixel[];
}

export default class HeatMap2D implements IHeatMap {
  // See my post about z-order curves!
  private curve: ZOrderCurve;
  private pixels: { [idx: number]: HeatMapPixel; } = {};
  private pixelsBuffer: { [idx: number]: HeatMapPixel; } = {};

  private observedMaxValue: number = 0;
  private observedMinValue: number = 0;

  public getMaxObservedValue = () => this.observedMaxValue;
  public getMinObservedValue = () => this.observedMinValue;
  public getWidth = () => this.width;
  public getHeight = () => this.height;
  public getMaxValue = () => this.maxValue;
  public getMinValue = () => this.minValue;
  public getPixels = () => Object.values(this.pixels)

  constructor(
    private width: number,
    private height: number,
    private minValue: number = 0,
    private maxValue: number = 255,
    private decayRate: number = 0.01,
  ) {
    this.curve = new ZOrderCurve(width, height);
  }

  public setValueAt = (
    x: number,
    y: number,
    value: number,
    radius: number = 0
  ) => {
    if (radius === 0) {
      const idx = this.curve.getIndex(x, y);
      this.pixels[idx] = { x, y, value };
    } else {
      this.setRadialValueAt(x, y, value, radius, false);
    }
  };


  public addValueAt = (
    x: number,
    y: number,
    value: number,
    radius: number = 0
  ) => {
    if (radius === 0) {
      const idx = this.curve.getIndex(x, y);
      this.pixels[idx] = { x, y, value: (this.pixels[idx]?.value ?? 0) + value };
    } else {
      this.setRadialValueAt(x, y, value, radius, true);
    }
  };

  private clampMinMax = (v: number) => {
    return Math.min(this.maxValue, Math.max(this.minValue, v));
  };

  private setRadialValueAt = (
    originX: number,
    originY: number,
    value: number,
    radius: number,
    add?: boolean
  ) => {
    const { pixels } = this;
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const dist = x * x + y * y;
        if (dist > radius * radius) {
          continue;
        }

        const ratio = 1 - dist / ((radius * radius) + 1e-4);

        var idx = this.curve.getIndex(originX + x, originY + y);
        const val = value * ratio; //this.maxValue * ratio;

        let nextVal = val;

        if (add) {
          nextVal += pixels[idx]?.value ?? this.minValue;
        } else {
          nextVal += Math.max(this.maxValue, pixels[idx]?.value ?? this.minValue);
        }
        // nextVal = nextVal | 0;
        pixels[idx] = { x: originX + x, y: originY + y, value: nextVal };
      }
    }
  };

  public getValueAt = (x: number, y: number) => {
    const idx = this.curve.getIndex(x, y);
    return this.pixels[idx]?.value ?? this.minValue;
  };

  private boxBlur = (amount: number = 1) => {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const pxId = this.curve.getIndex(x, y);

        var tX;
        var tY;
        var averagedValue = 0;
        var count = 0;
        for (let blurY = -amount; blurY <= amount; blurY++) {
          for (let blurX = -amount; blurX <= amount; blurX++) {
            tX = x + blurX;
            tY = y + blurY;
            count += 1;

            if (tX < 0 || tY < 0 || tX >= this.width || tY >= this.height) {
              averagedValue += this.minValue;
            } else {
              var idx = this.curve.getIndex(tX, tY);
              var value = this.pixels[idx]?.value || this.minValue;
              averagedValue += value;
            }
          }
        }

        // The `|0` floor here is actually pretty important. Without it, the values never actually
        // hit zero and the map will have persistent values in those cells, even after it should
        // have dissipated.
        let nextVal = this.clampMinMax((averagedValue / count) | 0);
        // nextVal *= 0.75;

        this.observedMaxValue = nextVal > this.observedMaxValue ? nextVal : this.observedMaxValue;
        this.observedMinValue = nextVal < this.observedMinValue ? nextVal : this.observedMinValue;


        if (nextVal <= this.minValue + 0.01) {
          delete this.pixelsBuffer[pxId];
        } else {
          this.pixelsBuffer[pxId] = { x, y, value: nextVal };
        }
      }
    }

    [this.pixels, this.pixelsBuffer] = [this.pixelsBuffer, this.pixels];
    return this.pixels;
  };


  private stepDelta = 0;
  private fixedTimeStep = 1000/24;
  public update = (deltaTime: number) => {
    this.stepDelta += deltaTime;

    if(this.stepDelta > this.fixedTimeStep * 5) {
      this.boxBlur();
      this.stepDelta = 0;
      return;
    }

    while (this.stepDelta >= this.fixedTimeStep) {
      this.stepDelta -= this.fixedTimeStep;
      this.boxBlur();
    }
  };

}
