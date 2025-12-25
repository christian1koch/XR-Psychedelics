import type { EffectSet } from "@/lib/types";
import { PixelateEffect } from "@/shaders/CustomPixelEffect";

export function createPixelateEffects(strength: number): EffectSet {
    const pixelate = new PixelateEffect(
        strength <= 0.01 ? 2048 : 200 / strength
    );
    const effects = [pixelate];

    return {
        effects,
        updateParams: (s) => {
            const pixelSize = s <= 0.01 ? 2048 : 200 / s;
            pixelate.uniforms.get("pixelSize")!.value = pixelSize;
        },
        dispose: () => {
            effects.forEach((effect) => effect.dispose());
        },
    };
}
