export const ButtonsNames = ["trigger", "grip", "joystick", "A", "B", "X", "Y"] as const;

export type Button = (typeof ButtonsNames)[number];

const ButtonsMapping: { [key in XRHandedness]?: { [key: number]: Button | null } } = {
  left: {
    0: "trigger",
    1: "grip",
    2: null,
    3: "joystick",
    4: "X",
    5: "Y",
    6: null,
  },
  right: {
    0: "trigger",
    1: "grip",
    2: null,
    3: "joystick",
    4: "A",
    5: "B",
    6: null,
  },
};

export class XRGamepadMonitor {
  private prevButtonsState: ReadonlyArray<GamepadButton>;
  private buttonsState: ReadonlyArray<GamepadButton>;
  private xr: THREE.WebXRManager;
  private handedness: XRHandedness;

  constructor(xr: THREE.WebXRManager, handedness: XRHandedness) {
    this.xr = xr;
    this.handedness = handedness;
  }

  update() {
    this.prevButtonsState = this.copyState(this.buttonsState);
    this.pollInputs();
  }

  isDown(button: Button): boolean {
    const idx = this.nameToIndex(button);
    return this.buttonsState[idx]?.pressed;
  }

  isTouched(button: Button): boolean {
    const idx = this.nameToIndex(button);
    return this.buttonsState[idx]?.touched;
  }

  wasPressed(button: Button): boolean {
    const idx = this.nameToIndex(button);
    const state = this.buttonsState[idx];
    const prevState = this.prevButtonsState?.[idx];

    if (!state || !prevState) return false;

    return state.pressed && !prevState.pressed;
  }

  wasReleased(button: Button): boolean {
    const idx = this.nameToIndex(button);
    const state = this.buttonsState[idx];
    const prevState = this.prevButtonsState?.[idx];

    if (!state || !prevState) return false;

    return !state.pressed && prevState.pressed;
  }

  getValue(button: Button): number {
    return this.buttonsState[this.nameToIndex(button)]?.value;
  }

  private get source(): XRInputSource {
    const session = this.xr.getSession();
    if (!session) throw new Error("XRGamepadMonitor: no session");

    for (let i = 0; i < session.inputSources.length; i++) {
      const src = session.inputSources[i];
      if (src.handedness == this.handedness) return src;
    }

    throw new Error("XRGamepadMonitor: no input sources");
  }

  private pollInputs() {
    const source = this.source;

    this.pollButtons(source.gamepad!);
    this.pollAxes(source.gamepad!);
  }

  private pollButtons(gamepad: Gamepad) {
    this.buttonsState = this.copyState(gamepad.buttons);
  }

  private pollAxes(gamepad: Gamepad) {}

  private nameToIndex(button: Button): number {
    const mapping = ButtonsMapping[this.handedness]!;

    for (const [idx, name] of Object.entries(mapping)) {
      if (name == button) return parseInt(idx);
    }

    return -1;
  }

  private copyState(state: ReadonlyArray<GamepadButton>): GamepadButton[] {
    const copied: GamepadButton[] = [];

    state?.forEach(
      (value, idx) => (copied[idx] = { pressed: value.pressed, touched: value.touched, value: value.value })
    );

    return copied;
  }
}
