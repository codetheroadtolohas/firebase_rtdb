export let mouse = {
  x: 0,
  y: 0,
};

export class Particle {
  constructor(id, x, y, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.color = color;
  }
  // update() {
  //   this.x = mouse.x;
  //   this.y = mouse.y;
  // }
  draw(ctx) {
    let radius = 5;
    let startAngle = 0;
    let endAngle = Math.PI * 2;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, startAngle, endAngle);
    ctx.fill();
  }
}
