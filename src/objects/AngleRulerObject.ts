import * as THREE from "three";

export type AngleRulerSettings = {
  angle: number;
  radius?: number;
  color?: THREE.ColorRepresentation;
};

type Disposable = { dispose: () => void };

export class AngleRulerObject extends THREE.Group {
  angle: number;
  radius: number;
  color: THREE.ColorRepresentation;

  private angleLine = new THREE.Line();

  private disposables: Disposable[] = [];

  constructor(settings: AngleRulerSettings) {
    super();

    this.angleLine.renderOrder = 1;
    this.add(this.angleLine);

    this.reset(settings);
  }

  reset(settings?: AngleRulerSettings) {
    if (settings) {
      this.angle = settings.angle;
      this.radius = settings.radius || 5;
      this.color = settings.color || 0x000000;
    }

    this.rebuild();
  }

  dispose() {
    this.disposables.forEach((o) => o.dispose());
    this.disposables.length = 0;
  }

  private rebuild() {
    this.dispose();

    const { PI } = Math;
    const { angle, radius, color } = this;

    const path = new THREE.Path();
    path.arc(0, 0, radius, PI - angle, PI);

    this.angleLine.geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
    this.angleLine.material = new THREE.LineBasicMaterial({ color });
    this.angleLine.material.depthTest = false;
    this.disposables.push(this.angleLine.geometry, this.angleLine.material);
  }
}
