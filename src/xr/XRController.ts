import * as THREE from "three";
import { ButtonsNames, XRGamepadMonitor } from "./XRGamepadMonitor";
import { OnConnectionEvent, XRControllerEvent, XRControllerEventListener } from "./types";

export enum XRControllerEvents {
  connected = "connected",
  disconnected = "disconnected",
  buttondown = "buttondown",
  buttonup = "buttonup",
  buttonhold = "buttonhold",
}

export class XRController {
  private readonly xr: THREE.WebXRManager;
  private readonly webxrController?: THREE.XRTargetRaySpace;
  private readonly index: number;
  private readonly dispatcher: THREE.EventDispatcher<XRControllerEvent>;
  private monitor: XRGamepadMonitor;
  private _handedness: XRHandedness;

  constructor(xr: THREE.WebXRManager, index: number) {
    this.xr = xr;
    this.index = index;
    this.dispatcher = new THREE.EventDispatcher();
    this.webxrController = this.xr.getController(index);
    this.webxrController.addEventListener("connected", this.onConnected.bind(this));
  }

  get connected(): boolean {
    return !!this.webxrController?.userData.connected;
  }

  get buttons(): readonly GamepadButton[] {
    return this.inputSource.gamepad.buttons;
  }

  get handedness(): XRHandedness {
    return this._handedness;
  }

  update() {
    if (this.monitor) {
      this.monitor.update();
      this.checkEvents();
    }
  }

  on<T extends XRControllerEvents>(type: T, listener: XRControllerEventListener<T>) {
    this.dispatcher.addEventListener(type as any, listener as any);
  }

  private get inputSource(): XRInputSource {
    // We assume that the inputSources array indices match with the controllers' indices
    const session = this.xr.getSession();
    if (!session) return null;

    for (let i = 0; i < session.inputSources.length; i++) {
      const source = session.inputSources[i];
      if (source.handedness == this.handedness) return source;
    }
  }

  private onConnected(event: OnConnectionEvent) {
    this._handedness = event.data.handedness;
    this.monitor = new XRGamepadMonitor(this.xr, event.data.handedness);

    this.webxrController.add(XRController.buildController(event.data.targetRayMode));
    this.webxrController.userData.connected = true;
    this.dispatcher.dispatchEvent({ type: XRControllerEvents.connected, controller: this });
  }

  private checkEvents() {
    const base = { controller: this };

    ButtonsNames.forEach((button) => {
      let type = XRControllerEvents.buttondown;
      if (this.monitor.wasPressed(button)) {
        const value = this.monitor.getValue(button);
        this.dispatcher.dispatchEvent({ ...base, type, button, value });
      }

      type = XRControllerEvents.buttonup;
      if (this.monitor.wasReleased(button)) this.dispatcher.dispatchEvent({ ...base, type, button });
    });
  }

  private static buildController(mode: XRTargetRayMode) {
    var geometry, material;

    // See WebXR > Concepts > Targeting categories
    // https://immersive-web.github.io/webxr/input-explainer.html#concepts
    switch (mode) {
      // Pointers can be tracked separately from the viewer (e.g. Cculus touch controllers)
      case "tracked-pointer":
        geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3));
        geometry.setAttribute("color", new THREE.Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3));
        material = new THREE.LineBasicMaterial({ vertexColors: true, blending: THREE.AdditiveBlending });
        return new THREE.Line(geometry, material);

      // Gaze-based input sources do not have their own tracking mechanism and instead use the viewer’s head position for targeting.
      case "gaze":
        geometry = new THREE.RingGeometry(0.02, 0.04, 32).translate(0, 0, -1);
        material = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true });
        return new THREE.Mesh(geometry, material);
    }
  }
}
