import * as THREE from "three";
import { addDatListener, guiOptions } from "../components/DatGUI";

const DEFAULT_LENGTH = 30;

type InclinedPlaneConditions = {
  length: number;
  radius: number;
  inclination: number; // Angle
};

type InclinedPlaneInstant = {
  time: number;
  position: THREE.Vector2;
  rotation: number;
};

export class InclinedPlaneModel {
  conditions: InclinedPlaneConditions;

  private static readonly updateEvent = "model-update";
  private static readonly finishUpdate = "finish-update";

  constructor(conditions: InclinedPlaneConditions) {
    this.conditions = JSON.parse(JSON.stringify(conditions));

    addDatListener("datgui-angle", (e) => {
      this.conditions.inclination = e.value;
      this.dispatchUpdate();
    });

    addDatListener("datgui-radius", (e) => {
      this.conditions.radius = e.value;
      this.dispatchUpdate();
    });

    addDatListener("datgui-released", () => {
      this.dispatchFinishUpdate();
    });
  }

  static fromDatGUI(): InclinedPlaneModel {
    const conditions = {
      length: DEFAULT_LENGTH,
      inclination: guiOptions.angle,
      radius: guiOptions.radius,
    };

    return new InclinedPlaneModel(conditions);
  }

  get height(): number {
    return Math.tan(this.conditions.inclination) * this.conditions.length;
  }

  get initPosition(): THREE.Vector2 {
    const { cos, sin, PI } = Math;
    const { radius: r, inclination: angle } = this.conditions;

    return new THREE.Vector2(r * sin(angle), this.height + r * cos(angle));
  }

  get acceleration(): number {
    const g = 9.81;
    return (3 / 4) * g * Math.sin(this.conditions.inclination);
  }

  solve(): InclinedPlaneInstant[] {
    const { cos, sin } = Math;
    const timestep = 0.01;
    const { radius, length, inclination: alpha } = this.conditions;
    const hypotenuse = length / cos(alpha);
    const path = new THREE.Vector2(cos(-alpha), sin(-alpha));

    let time = 0;
    let velocity = 0;
    let x = 0; // Distance traveled through hypotenuse

    const steps: InclinedPlaneInstant[] = [];

    while (x < hypotenuse) {
      const instant: InclinedPlaneInstant = {
        time,
        position: path.clone().multiplyScalar(x).add(this.initPosition),
        rotation: x / radius,
      };

      steps.push(instant);

      time += timestep;
      velocity += this.acceleration * timestep;
      x += velocity * timestep;
    }

    return steps;
  }

  onUpdate(callback: () => void) {
    addEventListener(InclinedPlaneModel.updateEvent, callback);
  }

  onFinishUpdate(callback: () => void) {
    addEventListener(InclinedPlaneModel.finishUpdate, callback);
  }

  private dispatchUpdate() {
    dispatchEvent(new Event(InclinedPlaneModel.updateEvent));
  }

  private dispatchFinishUpdate() {
    dispatchEvent(new Event(InclinedPlaneModel.finishUpdate));
  }
}
