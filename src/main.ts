import HeatMap2D from "./HeatMap";
import { HeatMapRenderer } from "./HeatMapRenderer";


class HeatMapTest {
  private map: HeatMap2D;
  private renderer: HeatMapRenderer;

  private strobe = 0;
  private mode = false;

  constructor(width: number, height: number, squareSize: number) {
    this.map = new HeatMap2D(width, height, 0, 100);
    this.renderer = new HeatMapRenderer(this.map, squareSize, document.querySelector('#demo-container'));

    this.renderer.canvas.addEventListener('click', () => {
      this.mode = !this.mode;
    });

    this.renderer.canvas.addEventListener('mousemove', (e) => {
      this.map.addValueAt((e.offsetX / this.renderer.canvas.width) * width, (e.offsetY / this.renderer.canvas.height) * height, 25, 2);
    });

    this.update();
    this.tick();
  }

  private rand = () => {
    return (Math.random() + Math.random() + Math.random()) / 3;
  };

  private randUniform = () => {
    return Math.random();
  };

  private tick = () => {
    this.strobe++;

    if (this.strobe % 20 === 0) {
      if (this.mode) {
        var x = (this.randUniform() * this.map.getWidth()) | 0;
        var y = (this.randUniform() * this.map.getHeight()) | 0;
        this.map.addValueAt(x, y, 50, 2);
      } else {
        var x = (this.rand() * this.map.getWidth()) | 0;
        var y = (this.rand() * this.map.getHeight()) | 0;
        this.map.addValueAt(x, y, 50, 4);
      }
    }
    requestAnimationFrame(this.tick);
  }

  private last: number = Date.now();
  update = () => {
    const now = Date.now();
    const delta = now - this.last;
    this.last = now;

    this.map.update(delta);
    this.renderer.draw();

    requestAnimationFrame(this.update);
  };
}

new HeatMapTest(50, 50, 10);
