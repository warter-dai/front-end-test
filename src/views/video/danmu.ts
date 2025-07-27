export class Danmu {
  private canvas;

  private video;

  private context;

  private requestAnimationFrameId: number;

  private colors = [
    "red",
    "blue",
    "#ccc",
    "blueviolet",
    "turquoise",
    "antiquewhite",
    "burlywood",
    "chartreuse",
  ];

  private danmuList: Array<{
    x: number;
    speed: number;
    color: string;
    text: string;
    y: number;
  }>;

  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    this.canvas = canvas;
    this.video = video;
    this.context = this.canvas.getContext("2d");
    this.danmuList = [];
    this.requestAnimationFrameId = -1;
  }

  init() {
    this.danmuList = [
      {
        x: this.video.clientWidth,
        y: 22,
        speed: 1,
        text: "test",
        color: "red",
      },
    ];
    this.canvas.width = this.video.clientWidth;
    this.canvas.height = this.video.clientHeight;

    this.video.addEventListener("play", () => {
      this.render();
    });

    this.video.addEventListener("pause", () => {
      cancelAnimationFrame(this.requestAnimationFrameId);
    });
  }

  render() {
    if (!this.context) return;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.danmuList.forEach((item) => {
      if (!this.context) return;
      item.x -= item.speed; // 更新弹幕的位置
      this.context.fillStyle = item.color;
      this.context.font = "20px Arial";
      this.context.fillText(item.text, item.x, item.y);

      if (item.x <= -20 * item.text.length) {
        // 当弹幕完全移出canvas时，从数组中删除它
        const index = this.danmuList.indexOf(item);
        this.danmuList.splice(index, 1);
      }
    });

    this.requestAnimationFrameId = requestAnimationFrame(() => {
      this.render();
    });
  }

  send(msg: string) {
    const colorIndex = Math.floor(Math.random() * this.colors.length);
    const y = Math.floor(Math.random() * (this.canvas.height - 22) + 22);
    const speed = Math.floor((Math.random() + 1) * 2);
    this.danmuList.push({
      x: this.video.clientWidth,
      y: y,
      speed: speed,
      text: msg,
      color: this.colors[colorIndex],
    });
  }
}
