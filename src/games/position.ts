import {
  Torch, drawBeat, drawHorn,
  drawBackground,
  ClipRect, Clip, Light,
  HEIGHT, WIDTH,
}  from "./draw";

import spirits from "./spirite";

function createDogClip(top:number, left: number, start: number) {
  const boundry = new ClipRect(HEIGHT/2 - 50, 50, WIDTH-100, HEIGHT-200);
  const clip = new Clip(spirits.spirites[0], boundry);
  const clips = [];
  for (let i=0; i< 24; i++) {
    clips.push(new ClipRect(0, 183*i, 183*(i+1), 200));
  }
  clip.clips.set("normal", clips);
  clip.top = top;
  clip.left = left;
  clip.currentClip = "normal";
  clip.currentFrame = start;
  return clip;
}

function getRandomNumber(range: number): number {
    return Math.floor(Math.random() * range);
}

class Scenario {
  status: string;
  clips: Array<Clip>;
  lights: Array<Light>;
  torch: Torch;
  constructor() {
    this.status = "pause";
    this.clips = [];
    for (let i = 0; i<20; i++) {
      this.clips.push(
        createDogClip(220 + getRandomNumber(80), 50 + getRandomNumber(800), (i * 2)% 24),
      );
    }
    this.lights = [
      new Light(0,0,90, 200, 110, 6),
      new Light(0,300,60, 140, 60, 3),
      new Light(0,300,60, 140, 110, -9),
      new Light(0,500,60, 140, 130, 4),
      new Light(0,500,60, 140, 80, -10),
      new Light(0,800,30, 90, 60, 2),
    ];
    this.torch = new Torch(100, 100, 40, 4, 4);

  }
  draw(ratioArray: Array<number>) {
    const c = document.getElementById("canvas")! as HTMLCanvasElement;
    //c.width = window.innerWidth;
    //c.height = window.innerHeight;
    c.width = WIDTH;
    c.height = HEIGHT;
    const context = c.getContext("2d")!;
    context.clearRect(0, 0, c.width, c.height);
    drawBackground(ratioArray, context);
    drawHorn(ratioArray, context);
    for (const obj of this.clips) {
        obj.draw(context);
    }
    for (const light of this.lights) {
      light.drawLight(ratioArray, context);
    }
    this.torch.drawLight(ratioArray, context);
    drawBeat(ratioArray, context);
  }

  step(ratioArray: Array<number>) {
    for (let i=0; i<this.clips.length; i++) {
      const obj = this.clips[i];
      obj.incFrame();
      const channelIdx = i % ratioArray.length;
      let vratio = 1;
      const amplifier = 40;
      if (ratioArray[channelIdx] > 1) {
        vratio = 1 + (ratioArray[channelIdx]-1) * amplifier;
      }
      const rx = 2 * Math.random() - 1;
      const ry = Math.sign(rx) * Math.sqrt(1 - rx*rx);
      obj.setSpeed(rx*vratio, ry*vratio);
    }
    for (const l of this.lights) {
      l.incFrame();
    }
    this.torch.incFrame();
  }
}



export const scenario = new Scenario();