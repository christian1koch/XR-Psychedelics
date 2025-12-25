import type { EffectSet } from "@/lib/types";
import { AfterImageEffectImpl } from "@/shaders/AfterimageEffect";

export function createAfterImageEffects(strength: number): EffectSet {
    const afterImage = new AfterImageEffectImpl({ damp: 0.8 * strength });
    const effects = [afterImage];

    return {
        effects,
        updateParams: (s) => {
            afterImage.damp = 0.8 * s;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}
