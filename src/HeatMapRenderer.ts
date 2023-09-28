import HeatMap2D from "./HeatMap";

export class HeatMapRenderer {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  private fontSize: number;

  private colors = [
    [0, 0, 0],
    [0, 0, 255],
    [0, 255, 0],
    [255, 255, 0],
    [255, 165, 0],
    [255, 0, 0], // red
  ];

  constructor(private map: HeatMap2D, private squareSize: number, public container?: HTMLElement) {
    this.setupCanvas(map.getWidth(), map.getHeight(), squareSize);
  }

  private setupCanvas(width: number, height: number, squareSize: number) {
    const canvas = document.createElement("canvas");
    canvas.width = width * squareSize;
    canvas.height = height * squareSize;
    (this.container ?? document.body).appendChild(canvas);
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.fontSize = Math.min(24, squareSize * 0.75);
  }

  private getHeatColor = (t: number) => {
    t = Math.max(0, Math.min(1, t));
    const i = Math.floor(t * (this.colors.length - 1));
    const a = this.colors[i];
    const b = this.colors[i + 1] || this.colors[i];
    const u = t * (this.colors.length - 1) - i;
    const lerped = a.map((v, j) => Math.round(v + u * (b[j] - v)));
    return `rgb(${lerped[0]}, ${lerped[1]}, ${lerped[2]})`;
  };

  public draw = () => {
    const { squareSize, canvas, context, fontSize } = this;
    const pixels = this.map.getPixels();
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = fontSize + "px Arial";

    for (const id in pixels) {
      const px = pixels[id];
      const t = px.value / (this.map.getMaxValue() + 0.0001);
      context.fillStyle = this.getHeatColor(t);
      context.fillRect(
        px.x * squareSize,
        px.y * squareSize,
        squareSize,
        squareSize
      );
    }
  };
}
