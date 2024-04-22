import * as THREE from "three";
import { InclinedPlaneModel } from "../models/InclinedPlaneModel";
import { WheelAnimation } from "./WheelAnimation";
import { RulerObject } from "./RulerObject";
import { AngleRulerObject } from "./AngleRulerObject";
import { addDatListener, guiOptions } from "../components/DatGUI";
import { vec3 } from "../utils/math";
import { Disposable } from "../types";
import { VariablesGrid } from "../utils/VariablesGrid";
import { WheelObject } from "./WheelObject";

const ObjectsIndex = {
  wheel: "Cylinder001",
};

export class PlaneObject extends THREE.Object3D {
  model: InclinedPlaneModel;

  static readonly depth = 10;
  static readonly wheelWidth = 7;

  private wheel: WheelObject;
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

    this.wheel = new WheelObject({ radius: this.model.conditions.radius, length: PlaneObject.wheelWidth });
    this.disposables.push(this.wheel);
    this.add(this.wheel);

    const planeGeometry = new THREE.BufferGeometry();
    const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x00dd44 });
    this.plane = new THREE.Mesh(planeGeometry, planeMaterial);
    this.add(this.plane);

    if (!this.wheel) console.error(`Wheel missing: no object found with name ${ObjectsIndex.wheel}`);

    this.model.onUpdate(() => this.updateModel());
    this.model.onFinishUpdate(() => this.finishUpdate());

    addDatListener("datgui-guides", (e) => (this.rulers.visible = e.value));

    this.buildRulers();
    this.updateModel();
    this.finishUpdate();
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
    const { tan } = Math;
    const { inclination: angle, radius: wheelRadius } = this.model.conditions;
    const h = this.model.height;
    const depth = PlaneObject.depth;
    const margin = new THREE.Vector2(1, tan(angle)).multiplyScalar(2);

    this.rulers.visible = false;

    const shape = new THREE.Shape();
    shape.moveTo(-margin.x, 0);
    shape.lineTo(-margin.x, h + margin.y);
    shape.lineTo(this.model.conditions.length, 0);

    this.plane.geometry.dispose();
    this.plane.geometry = new THREE.ExtrudeGeometry(shape, { depth, curveSegments: 3, bevelEnabled: false });
    this.plane.geometry.translate(0, 0, -depth);

    if (this.wheel.radius != wheelRadius) {
      this.wheel.radius = wheelRadius;
      this.wheel.reset();
    }
    this.wheel.position.copy(vec3(this.model.initPosition)).setZ(-PlaneObject.depth / 2);
    this.wheel.rotation.set(0, 0, 0);

    this.animation = new WheelAnimation(this.wheel, this.model);

    VariablesGrid.updateAcm(this.model.acceleration.toFixed(2));
  }

  private finishUpdate() {
    const { inclination: angle } = this.model.conditions;

    let { from, to } = this.heightRuler;
    this.heightRuler.to.set(0, this.model.height, 0);
    this.heightRuler.label!.text = from.distanceTo(to).toFixed(3) + " m";
    this.heightRuler.rebuild();

    this.angleRuler.angle = angle;
    this.angleRuler.reset();

    this.distanceRuler.from.copy(vec3(this.model.initPosition));
    this.distanceRuler.from.setZ(-PlaneObject.depth / 2);
    this.distanceRuler.rebuild();

    this.rulers.visible = guiOptions.showGuides;

    this.animation.play();
  }

  private buildRulers() {
    const { PI } = Math;
    const { inclination: angle, radius, length } = this.model.conditions;

    this.heightRuler = new RulerObject({
      from: new THREE.Vector3(0),
      to: new THREE.Vector3(0, this.model.height, 0),
      serif: 0.7,
      margin: 3,
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
      serif: 0.7,
      projection: true,
      label: { text: "" },
    });

    this.rulers.add(this.heightRuler, this.angleRuler, this.distanceRuler);
    this.disposables.push(this.heightRuler, this.angleRuler, this.distanceRuler);
  }
}
