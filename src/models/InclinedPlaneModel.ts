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

  constructor(conditions: InclinedPlaneConditions) {
    this.conditions = JSON.parse(JSON.stringify(conditions));

    addDatListener("datgui-phi", (e) => {
      this.conditions.inclination = e.value;
      this.dispatchUpdate();
    });

    addDatListener("datgui-radius", (e) => {
      this.conditions.radius = e.value;
      this.dispatchUpdate();
    });
  }

  static fromDatGUI(): InclinedPlaneModel {
    const conditions = {
      length: DEFAULT_LENGTH,
      inclination: guiOptions.phi,
      radius: guiOptions.radius,
    };

    return new InclinedPlaneModel(conditions);
  }

  get height(): number {
    return Math.tan(this.conditions.inclination) * this.conditions.length;
  }

  get initPosition(): THREE.Vector2 {
    const { cos, sin, PI } = Math;
    const { radius: r, inclination: phi } = this.conditions;

    return new THREE.Vector2(r * sin(phi), this.height + r * cos(phi));
  }

  solve(): InclinedPlaneInstant[] {
    const { cos, sin } = Math;
    const { radius: r, length: l, inclination } = this.conditions;

    const path = new THREE.Vector2(cos(-inclination), sin(-inclination)).multiplyScalar(l);

    return [
      { time: 0, position: this.initPosition, rotation: 0 },
      { time: 3, position: this.initPosition.add(path), rotation: this.height / sin(inclination) / r },
    ];
  }

  onUpdate(callback: () => void) {
    addEventListener(InclinedPlaneModel.updateEvent, callback);
  }

  private dispatchUpdate() {
    dispatchEvent(new Event(InclinedPlaneModel.updateEvent));
  }
}
