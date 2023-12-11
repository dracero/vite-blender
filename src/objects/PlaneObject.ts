import * as THREE from "three";
import { InclinedPlaneModel } from "../models/InclinedPlaneModel";
import { WheelAnimation } from "./WheelAnimation";

const ObjectsIndex = {
  wheel: "Cylinder001",
};

export class PlaneObject extends THREE.Object3D {
  model: InclinedPlaneModel;

  private static readonly depth = 10;

  private wheel: THREE.Mesh;
  private plane: THREE.Mesh;
  private animation: WheelAnimation;

  constructor() {
    super();

    // this.add(scene);
    this.name = "plane-object";

    this.model = InclinedPlaneModel.fromDatGUI();
    this.wheel = this.buildWheel();
    this.add(this.wheel);

    const planeGeometry = new THREE.BufferGeometry();
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00dd44 });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.add(this.plane);

    if (!this.wheel) console.error(`Wheel missing: no object found with name ${ObjectsIndex.wheel}`);

    this.updateModel();
    this.model.onUpdate(() => this.updateModel());

    this.animation = new WheelAnimation(this.wheel, this.model);
    this.animation.play();
  }

  update() {
    this.animation.update();
  }

  private updateModel() {
    const { tan } = Math;
    const { height: h, inclination: phi, radius: r } = this.model.conditions;
    const depth = PlaneObject.depth;
    const margin = new THREE.Vector2(1, tan(phi)).multiplyScalar(2);

    const shape = new THREE.Shape();
    shape.moveTo(-margin.x, 0);
    shape.lineTo(-margin.x, h + margin.y);
    shape.lineTo(this.model.horizontalLength, 0);

    this.plane.geometry.dispose();
    this.plane.geometry = new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 3, bevelEnabled: false });
    this.plane.geometry.translate(0, 0, -depth);

    this.wheel.geometry.dispose();
    this.wheel.removeFromParent();
    this.wheel = this.buildWheel();
    this.add(this.wheel);

    this.animation = new WheelAnimation(this.wheel, this.model);
    this.animation.play();
  }

  private buildWheel(): THREE.Mesh {
    const { radius: r } = this.model.conditions;

    const geometry = new THREE.CylinderGeometry(r, r, 0.2, 8);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xdd4400 });
    return new THREE.Mesh(geometry, material);
  }
}
