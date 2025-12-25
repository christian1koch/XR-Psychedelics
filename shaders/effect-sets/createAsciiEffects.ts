import {
    ASCIIEffect,
    ASCIITexture,
    BlendFunction,
    BloomEffect,
    NoiseEffect,
    VignetteEffect,
} from "postprocessing";
import type { EffectSet } from "@/lib/types";

export function createAsciiEffects(strength: number): EffectSet {
    const asciiTexture = new ASCIITexture({
        characters: " .:-=+*#%@",
        font: "monospace",
        fontSize: 54,
        cellCount: 16,
    });
    const ascii = new ASCIIEffect({
        asciiTexture,
        cellSize: 16,
        color: "#00ff41",
    });
    const bloom = new BloomEffect({
        intensity: 1.5 * strength,
        luminanceThreshold: 0.2,
        luminanceSmoothing: 0.9,
        mipmapBlur: true,
    });
    const vignette = new VignetteEffect({
        offset: 0.3,
        darkness: 0.1 * strength,
        blendFunction: BlendFunction.NORMAL,
    });
    const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY });
    noise.blendMode.setOpacity(0.05 * strength);

    const effects = [ascii, bloom, vignette, noise];

    return {
        effects,
        updateParams: (s) => {
            bloom.intensity = 1.5 * s;
            vignette.darkness = 0.1 * s;
            noise.blendMode.setOpacity(0.05 * s);
        },
        dispose: () => {
            asciiTexture.dispose();
            effects.forEach((effect) => effect.dispose());
        },
    };
}
