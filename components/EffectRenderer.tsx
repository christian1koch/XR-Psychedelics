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

export default function EffectRenderer({
    selectedTrip,
}: {
    selectedTrip: Trip;
}) {
    return (
        <>
            {selectedTrip === Trip.Shroom && (
                <EffectComposer enableNormalPass={false} multisampling={2}>
                    <PsychedelicEffectFX
                        waveSpeed={2}
                        noiseDistortionStrength={0.5}
                        noiseDistortionScale={4}
                        noiseDistortionSpeed={0.2}
                        chromaticOffset={0.004}
                    />
                </EffectComposer>
            )}
            {selectedTrip === Trip.ASCII && <ASCIIEffect />}
            {selectedTrip === Trip.AfterImage && (
                <EffectComposer>
                    <AfterImageEffect damp={0.8} />
                </EffectComposer>
            )}
            {selectedTrip === Trip.CustomPixelate && (
                <EffectComposer>
                    <CustomPixelateEffect />
                </EffectComposer>
            )}
            {selectedTrip === Trip.Test && (
                <>
                    <EffectComposer>
                        {/* <Vignette key="vignette" darkness={0.5} offset={0.3} /> */}
                        {/* <AnimatedShroomPostFX /> */}
                        <WaveDistortionEffect amplitude={0.01} />
                        <BrightnessContrast brightness={50} contrast={100} />
                        <AfterImageEffect damp={0.7} />
                        <ElectricPatternEffect
                            intensity={0.5}
                            scale={0.5}
                            speed={0.02}
                            colorA={[141 / 255, 232 / 255, 189 / 255]}
                            // purple
                            colorB={[141 / 255, 89 / 255, 232 / 255]}
                        />
                        <HueSaturation
                            blendFunction={BlendFunction.COLOR_BURN} // blend mode
                            hue={Math.PI / 2} // hue in radians
                            saturation={0.999} // saturation in radians
                        />
                    </EffectComposer>
                </>
            )}
            {selectedTrip === Trip.PurpleVoid && (
                <EffectComposer>
                    <PurpleVoidEffect />
                </EffectComposer>
            )}
            {selectedTrip === Trip.Psych && (
                <EffectComposer>
                    <PsychEffect />
                </EffectComposer>
            )}
        </>
    );
}
