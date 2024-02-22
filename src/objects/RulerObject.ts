import * as THREE from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import { Disposable } from "../types";
import { AssetsManager } from "../utils/AssetsManager";

export type RulerSettings = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  serif?: number;
  margin?: number;
  separationDir?: THREE.Vector3; // Normalized, please
  color?: THREE.ColorRepresentation;
  projection?: boolean;
  label?: {
    text: string;
    rotation?: number;
  };
};

export class RulerObject extends THREE.Group {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: THREE.Color;
  serif: number;
  margin: number;
  separationDir?: THREE.Vector3;
  projection: boolean;
  label?: RulerSettings["label"];

  private mainLine: THREE.Line;
  private fromSerif: THREE.Line;
  private toSerif: THREE.Line;
  private fromProjection: THREE.LineSegments;
  private toProjection: THREE.LineSegments;
  private labelMesh: THREE.Mesh;

  private material: THREE.Material;
  private disposables: Disposable[] = [];

  private static dashSize = 0.2;

  static {
    AssetsManager.load("labelFont");
  }

  constructor(settings: RulerSettings) {
    super();

    this.mainLine = new THREE.Line();
    this.mainLine.renderOrder = 1;
    this.add(this.mainLine);

    this.fromSerif = new THREE.Line();
    this.fromSerif.renderOrder = 1;
    this.add(this.fromSerif);

    this.toSerif = new THREE.Line();
    this.toSerif.renderOrder = 1;
    this.add(this.toSerif);

    this.fromProjection = new THREE.LineSegments();
    this.fromProjection.renderOrder = 1;
    this.add(this.fromProjection);

    this.toProjection = new THREE.LineSegments();
    this.toProjection.renderOrder = 1;
    this.add(this.toProjection);

    this.labelMesh = new THREE.Mesh();
    this.labelMesh.renderOrder = 1;
    this.add(this.labelMesh);

    this.reset(settings);
  }

  reset(settings: RulerSettings) {
    this.validateSettings(settings);

    const { from, to, serif = 0, margin = 0, separationDir, color = 0x0, projection = false, label: label } = settings;

    this.from = from;
    this.to = to;
    this.color = new THREE.Color(color);
    this.serif = serif;
    this.margin = margin;
    this.separationDir = separationDir?.clone();
    this.projection = projection;
    this.label = label;

    this.rebuild();
  }

  rebuild() {
    const { from, to, serif, margin, separationDir, color, projection } = this;

    this.dispose();

    this.material = new THREE.LineBasicMaterial({ color });
    this.material.depthTest = false;
    this.disposables.push(this.material);

    // Build object
    const offset = separationDir?.clone().multiplyScalar(margin) || new THREE.Vector3();
    const mainPoints = [from.clone().add(offset), to.clone().add(offset)];
    const mainGeom = new THREE.BufferGeometry().setFromPoints(mainPoints);
    this.disposables.push(mainGeom);
    this.mainLine.geometry = mainGeom;
    this.mainLine.material = this.material;

    if (serif > 0) {
      const serifOffset = separationDir!.clone().multiplyScalar(serif / 2);
      const fromStart = from.clone().add(offset).add(serifOffset);
      const fromEnd = from.clone().add(offset).sub(serifOffset);
      const fromGeom = new THREE.BufferGeometry().setFromPoints([fromStart, fromEnd]);
      this.disposables.push(fromGeom);
      this.fromSerif.geometry = fromGeom;
      this.fromSerif.material = this.material;

      const toStart = to.clone().add(offset).add(serifOffset);
      const toEnd = to.clone().add(offset).sub(serifOffset);
      const toGeom = new THREE.BufferGeometry().setFromPoints([toStart, toEnd]);
      this.disposables.push(toGeom);
      this.toSerif.geometry = toGeom;
      this.toSerif.material = this.material;
    }

    if (projection) {
      const projMaterial = new THREE.LineDashedMaterial({
        color,
        dashSize: RulerObject.dashSize,
        gapSize: RulerObject.dashSize,
      });
      projMaterial.depthTest = false;
      this.disposables.push(projMaterial);

      let geom = new THREE.BufferGeometry().setFromPoints([from, from.clone().add(offset)]);
      this.disposables.push(geom);
      this.fromProjection.geometry = geom;
      this.fromProjection.material = projMaterial;
      this.fromProjection.computeLineDistances();

      geom = new THREE.BufferGeometry().setFromPoints([to, to.clone().add(offset)]);
      this.disposables.push(geom);
      this.toProjection.geometry = geom;
      this.toProjection.material = projMaterial;
      this.toProjection.computeLineDistances();
    }

    if (this.label) {
      const labelGeom = new TextGeometry(this.label.text, {
        font: AssetsManager.loaded.labelFont,
        size: 0.6,
        height: 0,
      });
      this.disposables.push(labelGeom);
      this.labelMesh.geometry = labelGeom;
      this.labelMesh.material = this.material;

      // Set position & rotation
      this.labelMesh.position.copy(to).sub(from).multiplyScalar(0.5).add(from);
      this.labelMesh.position.add(separationDir!.clone().multiplyScalar(margin + 0.5));
      const angle = this.label.rotation || to.clone().sub(from).angleTo(new THREE.Vector3(1));
      this.labelMesh.rotation.set(0, 0, -angle);
    }
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose?.());
    this.disposables.length = 0;
  }

  private validateSettings(settings: RulerSettings) {
    const { serif = 0, margin = 0, separationDir, label } = settings;

    if ((serif > 0 || margin > 0) && !separationDir)
      throw new Error("Param 'separationDir' must be specified if 'serif' or 'margin' is present");

    if (label && !separationDir) throw new Error("Param 'separationDir' must be specified if 'label' is present");
  }
}
