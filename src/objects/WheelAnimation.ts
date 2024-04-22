import * as THREE from "three";
import { InclinedPlaneModel } from "../models/InclinedPlaneModel";
import { addDatListener, guiOptions } from "../components/DatGUI";
import { Clock } from "../utils/Clock";
import { PlaneObject } from "./PlaneObject";

export class WheelAnimation {
  private mixer: THREE.AnimationMixer;
  private action: THREE.AnimationAction;
  private speed: number = guiOptions.speed;

  constructor(obj: THREE.Object3D, model: InclinedPlaneModel) {
    const positions: number[] = [];
    const rotations: number[] = [];
    const times: number[] = [];
    const instants = model.solve();

    for (let instant of instants) {
      const { position, rotation, time } = instant;
      positions.push(position.x, position.y, -PlaneObject.depth / 2);
      rotations.push(-rotation);
      times.push(time);
    }

    const positionTrack = new THREE.VectorKeyframeTrack(".position", times, positions);
    const rotationTrack = new THREE.VectorKeyframeTrack(".rotation[z]", times, rotations);
    const clip = new THREE.AnimationClip("wheel-animation", -1, [positionTrack, rotationTrack]);
    this.mixer = new THREE.AnimationMixer(obj);
    this.action = this.mixer.clipAction(clip);

    addDatListener("datgui-speed", (e) => (this.speed = e.value));

    addDatListener("datgui-togglePlay", () => this.togglePlay());

    addEventListener("togglePlay", () => this.togglePlay());
  }

  get time(): number {
    return this.action.time;
  }

  get isPlaying(): boolean {
    return this.action.isRunning();
  }

  play() {
    this.action.play();
  }

  update() {
    this.mixer.update(Clock.delta * this.speed);
    // this.slider.value = `${this.time / SphereAnimation.duration}`;
  }

  togglePlay(value = this.action.paused) {
    this.action.paused = !value;
  }
}
