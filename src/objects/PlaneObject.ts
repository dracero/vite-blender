import * as THREE from "three";
import { InclinedPlaneModel } from "../models/InclinedPlaneModel";
import { WheelAnimation } from "./WheelAnimation";
import { RulerObject } from "./RulerObject";
import { AngleRulerObject } from "./AngleRulerObject";
import { addDatListener, guiOptions } from "../components/DatGUI";
import { vec3 } from "../utils/math";
import { Disposable } from "../types";
import { VariablesGrid } from "../utils/VariablesGrid";

const ObjectsIndex = {
  wheel: "Cylinder001",
};

export class PlaneObject extends THREE.Object3D {
  model: InclinedPlaneModel;

  static readonly depth = 10;
  static readonly wheelWidth = 7;

  private wheel: THREE.Object3D;
  private plane: THREE.Mesh;
  private animation: WheelAnimation;

  private rulers: THREE.Group = new THREE.Group();
  private heightRuler: RulerObject;
  private angleRuler: AngleRulerObject;
  private distanceRuler: RulerObject;

  private disposables: Disposable[] = [];

  constructor() {
    super();

    this.name = "plane-object";
    this.rulers.visible = guiOptions.showGuides;
    this.add(this.rulers);

    this.model = InclinedPlaneModel.fromDatGUI();
    this.buildWheel();
    this.add(this.wheel);

    const planeGeometry = new THREE.BufferGeometry();
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00dd44 });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.add(this.plane);

    if (!this.wheel) console.error(`Wheel missing: no object found with name ${ObjectsIndex.wheel}`);

    this.buildRulers();

    this.updateModel();
    this.model.onUpdate(() => this.updateModel());

    this.animation = new WheelAnimation(this.wheel, this.model);
    this.animation.play();

    addDatListener("datgui-guides", (e) => (this.rulers.visible = e.value));
  }

  update() {
    this.animation.update();

    VariablesGrid.updateTime(this.animation.time.toFixed(2));

    const { from, to } = this.distanceRuler;
    this.distanceRuler.label = { text: from.distanceTo(to).toFixed(3) + " m" };
    this.distanceRuler.to.copy(this.wheel.position);
    this.distanceRuler.rebuild();
  }

  dispose() {
    this.disposables.forEach((o) => o.dispose());
    this.disposables.length = 0;
  }

  private updateModel() {
    const { tan, sin, cos } = Math;
    const { inclination: angle } = this.model.conditions;
    const h = this.model.height;
    const depth = PlaneObject.depth;
    const margin = new THREE.Vector2(1, tan(angle)).multiplyScalar(2);

    const shape = new THREE.Shape();
    shape.moveTo(-margin.x, 0);
    shape.lineTo(-margin.x, h + margin.y);
    shape.lineTo(this.model.conditions.length, 0);

    this.plane.geometry.dispose();
    this.plane.geometry = new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 3, bevelEnabled: false });
    this.plane.geometry.translate(0, 0, -depth);

    this.wheel.removeFromParent();
    this.wheel = this.buildWheel();
    this.add(this.wheel);

    this.animation = new WheelAnimation(this.wheel, this.model);
    this.animation.play();

    let { from, to } = this.heightRuler;
    this.heightRuler.to.set(0, this.model.height, 0);
    this.heightRuler.label!.text = from.distanceTo(to).toFixed(3) + " m";
    this.heightRuler.rebuild();

    this.angleRuler.angle = angle;
    this.angleRuler.reset();

    this.distanceRuler.from.copy(vec3(this.model.initPosition));
    this.distanceRuler.from.setZ(-PlaneObject.depth / 2);
    this.distanceRuler.separationDir!.set(sin(angle), cos(angle), 0);
    this.distanceRuler.rebuild();

    VariablesGrid.updateAcm(this.model.acceleration.toFixed(2));
  }

  private buildWheel(): THREE.Object3D {
    const { radius: r } = this.model.conditions;

    const disposables = this.wheel?.userData.disposables;
    if (disposables) disposables.forEach((disposable) => disposable.dispose());

    this.wheel = new THREE.Group();

    const geometry = new THREE.CylinderGeometry(r, r, 0.2, 16);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshPhongMaterial({ color: 0xdd4400 });
    const left = new THREE.Mesh(geometry, material);
    left.translateZ(-PlaneObject.wheelWidth / 2);
    const right = new THREE.Mesh(geometry, material);
    right.translateZ(PlaneObject.wheelWidth / 2);

    this.wheel.add(left);
    this.wheel.add(right);

    this.wheel.userData.disposables = [geometry];

    return this.wheel;
  }

  private buildRulers() {
    const { sin, cos, PI } = Math;
    const { inclination: angle, radius, length } = this.model.conditions;

    this.heightRuler = new RulerObject({
      from: new THREE.Vector3(0),
      to: new THREE.Vector3(0, this.model.height, 0),
      serif: 0.7,
      margin: 3,
      separationDir: new THREE.Vector3(-1),
      projection: true,
      color: 0x0,
      label: { text: "", rotation: -PI / 2 },
    });

    this.angleRuler = new AngleRulerObject({ angle });

    this.angleRuler.position.setX(length);

    this.distanceRuler = new RulerObject({
      from: vec3(this.model.initPosition).setZ(-PlaneObject.depth / 2),
      to: this.wheel.position,
      margin: radius + 1,
      separationDir: new THREE.Vector3(sin(angle), cos(angle), 0),
      serif: 0.7,
      projection: true,
      label: { text: "" },
    });

    this.rulers.add(this.heightRuler, this.angleRuler, this.distanceRuler);
    this.disposables.push(this.heightRuler, this.angleRuler, this.distanceRuler);
  }
}
