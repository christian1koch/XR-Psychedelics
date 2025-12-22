"use client";
import { MetroModel } from "@/app/demo/MetroModel";
import { ForestModel } from "@/app/demo/ForestModel";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AfterImageEffect,
    ASCIIEffect,
    ElectricPatternEffect,
    PsychedelicEffectFX,
    PsychEffect,
    WaveDistortionEffect,
} from "@/shaders";
import { CustomPixelateEffect } from "@/shaders/CustomPixelEffect";
import PurpleVoidEffect from "@/shaders/PurpleVoidEffect";
import { Canvas } from "@react-three/fiber";
import {
    BrightnessContrast,
    EffectComposer,
    HueSaturation,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useRef, useState } from "react";
import { Group, Mesh } from "three";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import TripSelection from "@/components/TripSelection";
import { TripScene, Trip, SceneInitialPositions } from "@/lib/types";
import SceneSelection from "@/components/SceneSeletion";

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 3, 5],
    Forest: [8, 3, 5],
};

export default function MetroPage() {
    const [selectedTrip, setSelectedTrip] = useState<Trip>(Trip.NONE);
    const [selectedScene, setSelectedScene] = useState<TripScene>(
        TripScene.Metro
    );
    const collidersRef = useRef<Mesh[]>([]);

    const modelRefCallback = (group: Group | null) => {
        if (group) {
            const meshes: Mesh[] = [];
            group.traverse((child) => {
                if ((child as Mesh).isMesh) {
                    meshes.push(child as Mesh);
                }
            });
            collidersRef.current = meshes;
        }
    };

    return (
        <>
            <div className="absolute">
                <div className="absolute top-4 left-4 z-10 flex flex-col">
                    <TripSelection
                        selectedItem={selectedTrip}
                        onItemSelect={setSelectedTrip}
                    />
                    <SceneSelection
                        selectedItem={selectedScene}
                        onItemSelect={setSelectedScene}
                    />

                    <div className="bg-background mt-2 w-full justify-center rounded-md p-1 text-center">
                        Click anywhere and move around
                    </div>
                </div>
            </div>
            <Canvas
                className="canvas"
                camera={{ fov: 75, near: 0.1, far: 1000 }}
            >
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[8, 4, 5]} intensity={0.5} />
                <FirstPersonCamera
                    collidersRef={collidersRef}
                    initialCameraPos={InitialPositions[TripScene.Metro]}
                />
                {selectedScene === TripScene.Metro && (
                    <MetroModel ref={modelRefCallback} />
                )}
                {selectedScene === TripScene.Forest && (
                    <ForestModel ref={modelRefCallback} />
                )}
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
                            <BrightnessContrast
                                brightness={50}
                                contrast={100}
                            />
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
            </Canvas>
        </>
    );
}
