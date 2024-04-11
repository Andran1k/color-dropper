function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

class ColorDropper {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly backgroundCanvas: HTMLCanvasElement;
  private readonly backgroundCtx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  // type is not important
  private mouseMoveHandler: any;

  private readonly zoomFactor: number;
  private readonly zoomRadius: number;
  private readonly rectSize: number;

  constructor(canvas: HTMLCanvasElement, backgroundCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.backgroundCanvas = backgroundCanvas;
    this.backgroundCtx = backgroundCanvas.getContext('2d', {willReadFrequently: true})!;
    this.x = 0;
    this.y = 0;
    this.mouseMoveHandler = null;

    this.zoomFactor = 11;
    this.zoomRadius = 6.5;
    this.rectSize = 10;
  }

  init() {
    if (!this.mouseMoveHandler) {
      this.mouseMoveHandler = this.handleMouseMove.bind(this);
      this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
    }
  }

  exit() {
    this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
    this.mouseMoveHandler = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.style.cursor = 'default';
  }

  private handleMouseMove({offsetX: mouseX, offsetY: mouseY}: MouseEvent) {
    this.x = mouseX;
    this.y = mouseY;

    this.drawEyeDropper();
  }

  private drawEyeDropper() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.drawLens();
    this.drawGrid();
    this.ctx.restore();
    this.drawText();
    this.drawDropperZone();
  }

  private drawLens() {
    const destX = this.x - this.zoomRadius * this.zoomFactor;
    const destY = this.y - this.zoomRadius * this.zoomFactor;

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.beginPath();
    this.ctx.arc(
      this.x,
      this.y,
      this.zoomRadius * this.zoomFactor,
      0,
      Math.PI * 2,
    );
    this.ctx.closePath();
    this.ctx.clip();

    this.ctx.drawImage(
      this.backgroundCanvas,
      Math.min(Math.max(0, this.x - this.zoomRadius), this.backgroundCanvas.width - this.zoomRadius) - this.zoomFactor / 2,
      Math.min(Math.max(0, this.y - this.zoomRadius), this.backgroundCanvas.height - this.zoomRadius) - this.zoomFactor / 2,
      this.zoomRadius * 2,
      this.zoomRadius * 2,
      destX,
      destY,
      this.zoomRadius * this.zoomFactor * 2,
      this.zoomRadius * this.zoomFactor * 2
    );
  };

  private drawGrid() {
    const gridSize = 1;
    this.ctx.strokeStyle = '#3f3f3f';
    this.ctx.lineWidth = 1;

    const destX = this.x - this.zoomRadius * this.zoomFactor;
    const destY = this.y - this.zoomRadius * this.zoomFactor;

    // vertical lines
    for (let x = destX; x < destX + this.zoomRadius * this.zoomFactor * 2; x += gridSize * this.zoomFactor) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, destY);
      this.ctx.lineTo(x, destY + this.zoomRadius * this.zoomFactor * 2);
      this.ctx.stroke();
    }

    // horizontal lines
    for (let y = destY; y < destY + this.zoomRadius * this.zoomFactor * 2; y += gridSize * this.zoomFactor) {
      this.ctx.beginPath();
      this.ctx.moveTo(destX, y);
      this.ctx.lineTo(destX + this.zoomRadius * this.zoomFactor * 2, y);
      this.ctx.stroke();
    }

    this.ctx.strokeStyle = '#ff0000';
    this.ctx.lineWidth = 2;

    const {x: middleRectX, y: middleRectY} = this.getCenterPixelCoords();

    this.ctx.strokeRect(middleRectX, middleRectY, this.rectSize, this.rectSize);
  }

  private drawText() {
    const {x: middleRectX, y: middleRectY} = this.getCenterPixelCoords();

    const text = this.getPickedColor();
    const textWidth = this.ctx.measureText(text).width;
    const fontSize = 12;
    const padding = 8;
    const margin = 10;
    const textX = middleRectX + this.rectSize / 2 - textWidth / 2;
    const textY = middleRectY + this.rectSize * 2 + padding + margin;
    const backgroundX = textX - padding / 2;
    const backgroundY = textY - padding / 2 - this.rectSize;
    const backgroundWidth = textWidth + padding;
    const backgroundHeight = fontSize + padding;

    this.ctx.fillStyle = '#828282';
    this.ctx.fillRect(backgroundX, backgroundY, backgroundWidth, backgroundHeight);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillText(text, textX, textY);
  }

  private drawDropperZone() {
    this.ctx.beginPath();
    this.ctx.arc(
      this.x,
      this.y,
      this.zoomRadius * this.zoomFactor,
      0,
      Math.PI * 2,
    );
    this.ctx.closePath();
    this.ctx.lineWidth = 10;
    this.ctx.strokeStyle = this.getPickedColor();
    this.ctx.stroke()

    this.ctx.beginPath();
    this.ctx.arc(
      this.x,
      this.y,
      this.zoomRadius * this.zoomFactor + 5,
      0,
      Math.PI * 2,
    );
    this.ctx.closePath();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = "#ffffff";
    this.ctx.stroke()
  }

  private getPixelColor(x: number, y: number) {
    const {data: pixel} = this.backgroundCtx.getImageData(x, y, 1, 1);
    return rgbToHex(pixel[0], pixel[1], pixel[2]);
  }

  private getCenterPixelCoords() {
    const x = this.x - this.rectSize / 2;
    const y = this.y - this.rectSize / 2;

    return {x, y}
  }

  getPickedColor() {
    const {x, y} = this.getCenterPixelCoords();
    // added -1 to get correct coordinate's color
    return this.getPixelColor(x - 1, y - 1);
  }
}

// ----------------------

const backgroundCanvas = document.getElementById('background') as HTMLCanvasElement;
const backgroundCtx = backgroundCanvas.getContext('2d', {willReadFrequently: true})!;
const eyeDropperCanvas = document.getElementById('eyeDropper') as HTMLCanvasElement;
const colorDropper = new ColorDropper(eyeDropperCanvas, backgroundCanvas);
const colorHex = document.getElementById('colorHex') as HTMLElement;
const dropperButton = document.getElementById('dropperButton') as HTMLButtonElement;

const imageURL = 'src/img/beach.jpg';
const img = new Image();
img.src = imageURL;
img.onload = () => {
  backgroundCtx.drawImage(img, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
};

dropperButton.addEventListener('click', () => {
  eyeDropperCanvas.style.cursor = 'none';
  colorDropper.init();
  eyeDropperCanvas.addEventListener('click', handleCanvasClick);
});

const handleCanvasClick = () => {
  colorHex.textContent = colorDropper.getPickedColor();
  colorDropper.exit();
  eyeDropperCanvas.removeEventListener('click', handleCanvasClick);
}

const copyButton = document.getElementById("copyButton") as HTMLButtonElement;
  copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(colorHex.textContent!);
});
