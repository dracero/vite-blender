import { XRControllerEvents, XRController } from "../xr/XRController";
import { Button } from "../xr/XRGamepadMonitor";

type Modify<T, R> = Omit<T, keyof R> & R;

export type XRRemappedGamepad = {
  hapticActuators: {
    pulse: (intensity: number /* 0 to 1 */, millis: number) => void;
  }[];
};

/* Events */

// Re-build from three/src/renderers/webxr/WebXRManager.js
export type OnConnectionEvent = {
  type: string;
  data: XRInputSource;
};

interface XRControllerEventTypeMap {
  [XRControllerEvents.connected]: XRControllerConnectedEvent;
  [XRControllerEvents.disconnected]: XRControllerDisconnectedEvent;
  [XRControllerEvents.buttondown]: XRControllerButtonDownEvent;
  [XRControllerEvents.buttonup]: XRControllerButtonUpEvent;
  [XRControllerEvents.buttonhold]: XRControllerBasicEvent<XRControllerEvents.buttonhold>;
}

export type XRControllerEvent =
  | XRControllerConnectedEvent
  | XRControllerDisconnectedEvent
  | XRControllerButtonDownEvent
  | XRControllerButtonUpEvent;

export type XRControllerBasicEvent<T extends XRControllerEvents> = {
  type: T;
  controller: XRController;
  // [key: string]: any;
};

export type XRControllerConnectedEvent = XRControllerBasicEvent<XRControllerEvents.connected>;

export type XRControllerDisconnectedEvent = XRControllerBasicEvent<XRControllerEvents.disconnected>;

export type XRControllerButtonDownEvent = XRControllerBasicEvent<XRControllerEvents.buttondown> & {
  button: Button;
  value: number;
};

export type XRControllerButtonUpEvent = XRControllerBasicEvent<XRControllerEvents.buttonup> & { button: Button };

export type XRControllerEventListener<T extends XRControllerEvents> = (e: XRControllerEventTypeMap[T]) => void;
