import { useEffect } from 'react';

type DatEventType = 'datgui-togglePlay' | 'datgui-speed' | 'datgui-2D' | 'datgui-angle' | 'datgui-radius' | 'datgui-guides'

class DatEvent extends Event {
  value: any;
  constructor(type: DatEventType, properties?: {}) {
    super(type);
    if (properties) Object.assign(this, properties);
  }
}

export const guiOptions = {
  togglePlay: () => {},
  speed: 1,
  angle: 0.3,
  radius: 2,
  showGuides: false,
  '2D': false 
}

export function addDatListener(type: DatEventType, callback: (e: DatEvent) => void) {
  addEventListener(type, callback as any)
}

export const DatGUI = () => {
  useEffect(() => {
    import('dat.gui').then(dat => {
      const gui = new dat.GUI();

      const dispatcher = (type: DatEventType) => (value: any) => dispatchEvent(new DatEvent(type, { value }))

      gui.add(guiOptions, 'togglePlay').name('▶ ⏸').onChange(dispatcher('datgui-togglePlay'))
      gui.add(guiOptions, 'speed', 0, 2, 0.1).name("Velocidad").onChange(dispatcher('datgui-speed'))
      gui.add(guiOptions, 'angle', 0.1, 1).name('α').onChange(dispatcher('datgui-angle'))
      gui.add(guiOptions, 'radius', 0.5, 5).name('Radio').onChange(dispatcher('datgui-radius'))
      gui.add(guiOptions, 'showGuides').name('Guías').onChange(dispatcher('datgui-guides'))
      gui.add(guiOptions, '2D').onChange(dispatcher('datgui-2D'))
    })
  })

  return null
}