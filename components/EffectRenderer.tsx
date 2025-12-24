"use client";
import { Trip } from "@/lib/types";
import {
    PsychedelicEffectFX,
    AfterImageEffect,
    WaveDistortionEffect,
    ElectricPatternEffect,
    PsychEffect,
    ASCIIEffect,
} from "@/shaders";
import { CustomPixelateEffect } from "@/shaders/CustomPixelEffect";
import PurpleVoidEffect from "@/shaders/PurpleVoidEffect";
import {
    BrightnessContrast,
    EffectComposer,
    HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useTripExperience } from "./TripExperienceContext";
import { useXR } from "@react-three/xr";
import XRStereoPostprocessing from "./XRStereoPostprocessing";

export default function EffectRenderer() {
    const { selectedTrip, strength } = useTripExperience();

    const { mode } = useXR();
    const isPresenting = mode === "immersive-vr" || mode === "immersive-ar";

    if (isPresenting) {
        return <XRStereoPostprocessing />;
    }

    return (
        <>
            {selectedTrip === Trip.Shroom && (
                <EffectComposer enableNormalPass={false} multisampling={2}>
                    <PsychedelicEffectFX
                        waveSpeed={2}
                        noiseDistortionStrength={0.5 * strength}
                        noiseDistortionScale={4}
                        noiseDistortionSpeed={0.2}
                        chromaticOffset={0.004 * strength}
                        waveAmplitude={0.025 * strength}
                        paletteIntensity={1.0 * strength}
                        paletteSaturation={0.5 * strength}
                        electricIntensity={1.0 * strength}
                        bloomIntensity={1.5 * strength}
                        vignetteDarkness={0.3 * strength}
                        trailDamp={0.85 * strength}
                    />
                </EffectComposer>
            )}
            {selectedTrip === Trip.ASCII && (
                <ASCIIEffect
                    bloomIntensity={1.5 * strength}
                    vignetteDarkness={0.1 * strength}
                    noiseOpacity={0.05 * strength}
                />
            )}
            {selectedTrip === Trip.AfterImage && (
                <EffectComposer>
                    <AfterImageEffect damp={0.8 * strength} />
                </EffectComposer>
            )}
            {selectedTrip === Trip.CustomPixelate && (
                <EffectComposer>
                    <CustomPixelateEffect
                        pixelSize={strength <= 0.01 ? 2048 : 200 / strength}
                    />
                </EffectComposer>
            )}
            {selectedTrip === Trip.Test && (
                <>
                    <EffectComposer>
                        <WaveDistortionEffect amplitude={0.01 * strength} />
                        <BrightnessContrast
                            // brightness={0.5 * strength}
                            contrast={0.5 * strength}
                        />

                        <ElectricPatternEffect
                            intensity={0.5 * strength}
                            scale={0.5}
                            speed={0.02}
                            colorA={[141 / 255, 232 / 255, 189 / 255]}
                            // purple
                            colorB={[141 / 255, 89 / 255, 232 / 255]}
                        />
                        <HueSaturation
                            blendFunction={BlendFunction.COLOR_BURN} // blend mode
                            hue={Math.PI / 2} // hue in radians
                            saturation={0.999 * strength} // saturation in radians
                        />
                    </EffectComposer>
                </>
            )}
            {selectedTrip === Trip.PurpleVoid && (
                <EffectComposer>
                    <PurpleVoidEffect strength={strength} />
                </EffectComposer>
            )}
            {selectedTrip === Trip.Psych && (
                <EffectComposer>
                    <PsychEffect intensity={0.01 * strength} />
                </EffectComposer>
            )}
        </>
    );
}
