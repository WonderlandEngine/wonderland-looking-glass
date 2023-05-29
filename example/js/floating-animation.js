import { Component, Type } from "@wonderlandengine/api";
import { vec3 } from "gl-matrix";

export class FloatingAnimation extends Component {
  static TypeName = "floating-animation";
  static Properties = {
    speed: { type: Type.Float, default: 0.8 },
    sizeX: { type: Type.Float, default: 0.01 },
    sizeY: { type: Type.Float, default: 0.02 },
    sizeZ: { type: Type.Float, default: 0.0 },
  };

  init() {
    this.time = Math.random() * 10.0;
    this.startPos = new Float32Array(3);
    this.lastPos = new Float32Array(3);
  }

  start() {
    this.object.getPositionLocal(this.startPos);
  }

  update(dt) {
    this.time += this.speed * dt;
    this.object.setPositionLocal(
      vec3.add(this.lastPos, this.startPos, [
        this.sizeX * Math.sin(0.8 * this.time),
        this.sizeY * Math.sin(0.9 * this.time),
        this.sizeZ * Math.sin(0.7 * this.time),
      ])
    );
  }
}
