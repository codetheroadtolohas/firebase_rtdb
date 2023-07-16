export class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  draw(ctx, fillStyle) {
    let radius = 20;
    let startAngle = 0;
    let endAngle = Math.PI * 2;

    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, startAngle, endAngle);
    ctx.fill();
  }
}
