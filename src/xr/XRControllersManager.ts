import * as THREE from "three";
import { XRController, XRControllerEvents } from "./XRController";
import { XRControllerEvent, XRControllerEventTypeMap } from "./types";

export enum ControllersManagerEvents {
  onConnected = "onConnected",
}

export class XRControllersManager extends THREE.EventDispatcher<any> {
  protected static _instance: XRControllersManager;
  protected static xr: THREE.WebXRManager;

  protected controllers: XRController[] = [];

  static setup(xrManager: THREE.WebXRManager) {
    if (this._instance) return;

    XRControllersManager.xr = xrManager;
    this._instance = new XRControllersManager();
  }

  static get instance() {
    return this._instance;
  }

  static update() {
    this.instance?.update();
  }

  get left(): XRController {
    return this.controllers.find((ctrl) => ctrl.handedness == "left")!;
  }

  get right(): XRController {
    return this.controllers.find((ctrl) => ctrl.handedness == "right")!;
  }

  connect() {
    this.controllers = [new XRController(XRControllersManager.xr, 0), new XRController(XRControllersManager.xr, 1)];
    this.controllers.forEach((ctrl) => ctrl.on(XRControllerEvents.connected, this.checkConnected.bind(this)));
  }

  onConnected(listener: () => void) {
    this.addEventListener(ControllersManagerEvents.onConnected, listener);
  }

  update() {
    this.controllers.forEach((c) => c.update());
  }

  private constructor() {
    super();
  }

  private checkConnected() {
    // Check that all controllers are connected
    for (const controller of this.controllers) if (!controller.connected) return;

    this.dispatchEvent({ type: ControllersManagerEvents.onConnected });
  }
}
