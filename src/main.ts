import HeatMap2D from "./HeatMap";
import { HeatMapRenderer } from "./HeatMapRenderer";

document.body.style.background = "#111";
document.body.style.overflow = "hidden";
document.body.style.margin = document.body.style.padding = "0";



class HeatMapTest {
  private map: HeatMap2D;
  private renderer: HeatMapRenderer;

  private otherMap: HeatMap2D;
  private otherRenderer: HeatMapRenderer;

  private strobe = 0;
  private mode = false;

  constructor(width: number, height: number, squareSize: number) {
    this.map = new HeatMap2D(width, height, 0, 100);
    this.renderer = new HeatMapRenderer(this.map, squareSize);

    this.otherMap = new HeatMap2D(width, height, 0, 100);
    this.otherRenderer = new HeatMapRenderer(this.map, squareSize);


    this.renderer.canvas.addEventListener('click', () => {
      this.mode = !this.mode;
    });

    this.renderer.canvas.addEventListener('mousemove', (e) => {
      this.map.addValueAt((e.offsetX / this.renderer.canvas.width) * width, (e.offsetY / this.renderer.canvas.height) * height, 25, 4);
      this.otherMap.addValueAt((e.offsetX / this.renderer.canvas.width) * width, (e.offsetY / this.renderer.canvas.height) * height, 25, 4);
    });

    this.update();
    this.updateOther();

    requestAnimationFrame(this.draw);
  }

  private rand = () => {
    return (Math.random() + Math.random() + Math.random()) / 3;
  };

  private randUniform = () => {
    return Math.random();
  };

  private draw = () => {
    // requestAnimationFrame(this.draw);
  }

  private last:number = Date.now();
  update = () => {
    const now = Date.now();
    const delta = now - this.last;
    this.last = now;

    this.strobe++;

    if (this.strobe % 20 === 0) {
      if (this.mode) {
        var x = (this.randUniform() * this.map.getWidth()) | 0;
        var y = (this.randUniform() * this.map.getHeight()) | 0;
        this.map.addValueAt(x, y, 20, 8);
        this.otherMap.addValueAt(x, y, 20, 8);
      } else {
        var x = (this.rand() * this.map.getWidth()) | 0;
        var y = (this.rand() * this.map.getHeight()) | 0;
        this.map.addValueAt(x, y, 20, 4);
        this.otherMap.addValueAt(x, y, 20, 4);
      }
    }

    this.map.update(delta);
    this.renderer.draw();

    requestAnimationFrame(this.update);
  };

  private otherLast:number = Date.now();
  updateOther = () => {
    const now = Date.now();
    const delta = now - this.otherLast;
    this.otherLast = now;
    this.otherMap.update(delta);

    this.otherRenderer.draw();
    setTimeout(this.updateOther, 1000 / 12);
  }
}

new HeatMapTest(100, 100, 5);
