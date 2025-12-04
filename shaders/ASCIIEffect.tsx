"use client";
import {
    EffectComposer,
    ASCII,
    Bloom,
    Vignette,
    Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

interface ASCIIEffectProps {
    /** ASCII character set density (default: " .:-=+*#%@") */
    characters?: string;
    /** Font size of ASCII characters (default: 54) */
    fontSize?: number;
    /** Cell size for ASCII grid (default: 16) */
    cellSize?: number;
    /** Text color (default: "#00ff41" - Matrix green) */
    color?: string;
    /** Bloom intensity (0 = disabled, default: 1.5) */
    bloomIntensity?: number;
    /** Vignette darkness (0 = disabled, default: 0.8) */
    vignetteDarkness?: number;
    /** Noise opacity (0 = disabled, default: 0.05) */
    noiseOpacity?: number;
}

export function ASCIIEffect({
    characters = " .:-=+*#%@",
    fontSize = 54,
    cellSize = 16,
    color = "#00ff41", // Matrix green
    bloomIntensity = 1.5,
    vignetteDarkness = 0.1,
    noiseOpacity = 0.05,
}: ASCIIEffectProps) {
    return (
        <EffectComposer>
            <ASCII
                characters={characters}
                fontSize={fontSize}
                cellSize={cellSize}
                color={color}
            />
            <Bloom
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={bloomIntensity}
                mipmapBlur
            />
            <Vignette
                offset={0.3}
                darkness={vignetteDarkness}
                blendFunction={BlendFunction.NORMAL}
            />
            <Noise
                opacity={noiseOpacity}
                blendFunction={BlendFunction.OVERLAY}
            />
        </EffectComposer>
    );
}
