import type { EffectSet } from "@/lib/types";
import { PsychEffectImpl } from "@/shaders/PsychEffect";

export function createPsychEffects(strength: number): EffectSet {
    const psych = new PsychEffectImpl({ intensity: 0.01 * strength });
    const effects = [psych];

    return {
        effects,
        updateParams: (s) => {
            psych.intensity = 0.01 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}
