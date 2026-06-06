export const jesus3DAnimationMap = {
  idle: "/models/jesus3d/jesus_idle.glb",
  appear: "/models/jesus3d/Meshy_AI_Tactical_Operative_biped_Animation_Wave_One_Hand_withSkin.glb",
  power: "/models/jesus3d/Meshy_AI_Tactical_Operative_biped_Animation_Grip_and_Throw_Down_withSkin.glb",
  clap: "/models/jesus3d/Meshy_AI_Tactical_Operative_biped_Animation_Stand_Clap_and_Sit_Down_withSkin.glb",
} as const;

export type Jesus3DAction = keyof typeof jesus3DAnimationMap;
