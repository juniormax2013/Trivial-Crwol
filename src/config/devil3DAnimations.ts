export const devil3DAnimationMap = {
  idle: "/models/devil3d/devil_idle.glb",
  appear: "/models/devil3d/devil_appear.glb",
  evilLaugh: "/models/devil3d/devil_evil_laugh.glb",
  attack: "/models/devil3d/devil_attack.glb",
  crouch: "/models/devil3d/devil_crouch_step_back.glb",
  disappear: "/models/devil3d/devil_disappear_sword.glb",
} as const;

export type Devil3DAction = keyof typeof devil3DAnimationMap;
