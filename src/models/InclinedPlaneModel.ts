import * as THREE from "three";
import { addDatListener, guiOptions } from "../components/DatGUI";

type InclinedPlaneConditions = {
  height: number;
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

    addDatListener("datgui-height", (e) => {
      this.conditions.height = e.value;
      this.dispatchUpdate();
    });

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
      height: guiOptions.height,
      inclination: guiOptions.phi,
      radius: guiOptions.radius,
    };

    return new InclinedPlaneModel(conditions);
  }

  get horizontalLength(): number {
    return this.conditions.height / Math.tan(this.conditions.inclination);
  }

  get initPosition(): THREE.Vector2 {
    const { cos, sin, PI } = Math;
    const { radius: r, height: h, inclination } = this.conditions;

    const alpha = PI / 2 - inclination;
    return new THREE.Vector2(r * cos(alpha), h + r * sin(alpha));
  }

  solve(): InclinedPlaneInstant[] {
    const { cos, sin } = Math;
    const { horizontalLength: l } = this;
    const { height: h, radius: r, inclination } = this.conditions;

    const path = new THREE.Vector2(cos(-inclination), sin(-inclination)).multiplyScalar(l);

    return [
      { time: 0, position: this.initPosition, rotation: 0 },
      { time: 3, position: this.initPosition.add(path), rotation: h / Math.sin(inclination) / r },
    ];
  }

  onUpdate(callback: () => void) {
    addEventListener(InclinedPlaneModel.updateEvent, callback);
  }

  private dispatchUpdate() {
    dispatchEvent(new Event(InclinedPlaneModel.updateEvent));
  }
}
