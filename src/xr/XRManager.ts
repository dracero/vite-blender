import * as THREE from "three";
import { VRButton } from "three/examples/jsm/webxr/VRButton";
import { XRControllersManager } from "./XRControllersManager";
import { XRControllerEvents } from "./XRController";
import type { XRControllerButtonDownEvent } from "./types";

export namespace XRManager {
  let renderer: THREE.WebGLRenderer;
  let baseReferenceSpace: XRReferenceSpace;

  export function init(r: THREE.WebGLRenderer) {
    // Check if already initialized
    if (renderer) return;

    renderer = r;

    navigator.xr?.isSessionSupported("immersive-vr").then((supported) => {
      if (supported) {
        enableXR();
      } else {
        console.log("VR not supported");
      }
    });
  }

  // "Private" stuff
  function enableXR() {
    renderer.xr.enabled = true;

    const vrButton = VRButton.createButton(renderer);
    document.body.appendChild(vrButton);

    XRControllersManager.setup(renderer.xr);

    renderer.xr.addEventListener("sessionstart", () => {
      baseReferenceSpace = renderer.xr.getReferenceSpace()!;
      teleport(new THREE.Vector3(20, 10, 20));

      const controllers = XRControllersManager.instance;
      controllers.onConnected(() => {
        controllers.left.on(XRControllerEvents.buttondown, (ev: XRControllerButtonDownEvent) => {
          if (ev.button == "Y" || ev.button == "X") dispatchEvent(new Event("togglePlay"));
        });

        controllers.right.on(XRControllerEvents.buttondown, (ev: XRControllerButtonDownEvent) => {
          if (ev.button == "A" || ev.button == "B") dispatchEvent(new Event("togglePlay"));
        });
      });
      controllers.connect();
    });

    renderer.xr.addEventListener("sessionend", function (event) {
      //
    });
  }

  function teleport(pos: THREE.Vector3) {
    const viewerYRotation = 0;
    const position = pos.clone().negate();

    // Dado que internamente WebXR aplica primero M = MRotation * Mtranslate
    // la traslacion debe ser aplicada sobre el sistema de coordenadas rotado en Y
    // por eso es necesario aplicar esta transformacion
    // para que al rotar, el usuario rote sobre el lugar en el que esta parado y no alrededor del 0,0,0 del mundo
    let mRot = new THREE.Matrix4();
    mRot.makeRotationY(viewerYRotation);
    position.applyMatrix4(mRot);

    const offsetPosition = {
      x: position.x,
      y: position.y,
      z: position.z,
      w: 1,
    };

    const offsetRotation = new THREE.Quaternion();
    offsetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), viewerYRotation);

    const transform = new XRRigidTransform(offsetPosition, offsetRotation);
    const spaceOffset = baseReferenceSpace.getOffsetReferenceSpace(transform);

    renderer.xr.setReferenceSpace(spaceOffset);
  }
}
