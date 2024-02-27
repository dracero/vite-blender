import * as THREE from "three";
import { Disposable } from "../types";

export type WheelProps = {
  radius: number;
  length: number;
};

export class WheelObject extends THREE.Group implements Disposable {
  radius: number;
  length: number;

  private static segments = 32;

  private disposables: Disposable[] = [];

  constructor(props: WheelProps) {
    super();

    this.reset(props);
  }

  reset(props?: WheelProps) {
    if (props) {
      this.radius = props.radius;
      this.length = props.length;
    }

    this.dispose();
    this.clear();

    const { segments } = WheelObject;
    const { length } = this;

    const wheelMat = this.newWheelMaterial();
    this.disposables.push(wheelMat);

    const wheelGeom = this.newWheelGeometry();
    this.disposables.push(wheelGeom);

    const leftWheel = new THREE.Mesh(wheelGeom, wheelMat);
    leftWheel.translateZ(length / 2);
    this.add(leftWheel);

    const rightWheel = new THREE.Mesh(wheelGeom, wheelMat);
    rightWheel.translateZ(-length / 2);
    this.add(rightWheel);

    const barGeom = new THREE.CylinderGeometry(0.1, 0.1, length - 0.01, segments / 2);
    barGeom.rotateX(Math.PI / 2);
    this.disposables.push(barGeom);

    const barMat = new THREE.MeshPhongMaterial({ color: 0x334444 });
    this.disposables.push(barMat);

    const bar = new THREE.Mesh(barGeom, barMat);
    this.add(bar);
  }

  dispose() {
    this.disposables.forEach((o) => o.dispose());
    this.disposables.length = 0;
  }

  private newWheelGeometry(): THREE.BufferGeometry {
    const { segments: curveSegments } = WheelObject;
    const { radius } = this;

    const circle = new THREE.EllipseCurve(0, 0, radius, radius);
    const shape = new THREE.Shape(circle.getPoints(curveSegments));
    const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.2, curveSegments, bevelEnabled: false });
    return geom;
  }

  private newWheelMaterial(): THREE.Material {
    return new THREE.ShaderMaterial({
      uniforms: {
        uDivisions: { value: 6 },
        uColor1: { value: [0.0, 0.4, 0.4] },
        uColor2: { value: [0.6, 0.6, 0.6] },
      },

      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        precision mediump float;
        #define PI 3.141592
        varying vec2 vUv;
        uniform float uDivisions;
        uniform vec3 uColor1, uColor2;
        
        void main() {
          vec2 uv = vUv;
          float angle = atan(uv.y, uv.x) + PI;

          int n = int(angle / PI / 2.0 * float(uDivisions));
          vec3 color = (n % 2 == 0) ? uColor1 : uColor2;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    });
  }
}
