export type FramePowerId = 'crown' | 'fire' | 'gold' | string;

export interface FramePowerDef {
  id: FramePowerId;
  name: string;
  description: string;
  icon: string;
  effects: string[]; // List of power-up IDs this frame grants
}

export const FRAME_POWERS: Record<string, FramePowerDef> = {
  crown: {
    id: 'crown',
    name: 'Pouvwa Kouwòn',
    description: 'Retire 2 repons epi ba ou yon 2yèm chans!',
    icon: '/assets/store/frames/crown-frame.png',
    effects: ['removeTwo', 'secondChance'],
  },
  // Future frames can be added here
  // fire: {
  //   id: 'fire',
  //   name: 'Pouvwa Dife',
  //   description: 'Glase tan an!',
  //   icon: '/assets/store/frames/fire-frame.png',
  //   effects: ['freezeTime'],
  // },
};

export const getFramePower = (frameId: string | null | undefined): FramePowerDef | null => {
  if (!frameId) return null;
  return FRAME_POWERS[frameId] || null;
};
