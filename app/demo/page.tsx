"use client";
import { MetroModel } from "@/app/demo/MetroModel";
import { ForestModel } from "@/app/demo/ForestModel";
import { Slider } from "@/components/ui/slider";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Group, Mesh } from "three";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import TripSelection from "@/components/TripSelection";
import { TripScene, Trip, SceneInitialPositions } from "@/lib/types";
import SceneSelection from "@/components/SceneSeletion";
import EffectRenderer from "@/components/EffectRenderer";
import SceneRenderer from "@/components/SceneRenderer";

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 3, 5],
    Forest: [8, 3, 5],
};

export default function MetroPage() {
    const [selectedTrip, setSelectedTrip] = useState<Trip>(Trip.NONE);
    const [selectedScene, setSelectedScene] = useState<TripScene>(
        TripScene.Metro
    );
    const [strength, setStrength] = useState<number>(1);
    const collidersRef = useRef<Mesh[]>([]);

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

                    <div className="bg-background mt-2 w-full rounded-md p-4">
                        <div className="mb-2 text-center text-sm font-medium">
                            Strength: {strength.toFixed(2)}
                        </div>
                        <Slider
                            value={[strength]}
                            onValueChange={(value) => setStrength(value[0])}
                            max={2}
                            step={0.05}
                        />
                    </div>

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
                    key={selectedScene}
                    collidersRef={collidersRef}
                    initialCameraPos={InitialPositions[TripScene.Metro]}
                />
                <SceneRenderer
                    selectedScene={selectedScene}
                    collidersRef={collidersRef}
                />
                <EffectRenderer
                    selectedTrip={selectedTrip}
                    strength={strength}
                />
            </Canvas>
        </>
    );
}
