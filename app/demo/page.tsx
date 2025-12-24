"use client";
import { Slider } from "@/components/ui/slider";
import { Canvas } from "@react-three/fiber";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import TripSelection from "@/components/TripSelection";
import { TripScene, SceneInitialPositions } from "@/lib/types";
import SceneSelection from "@/components/SceneSeletion";
import EffectRenderer from "@/components/EffectRenderer";
import SceneRenderer from "@/components/SceneRenderer";
import {
    TripExperienceProvider,
    useTripExperience,
} from "@/components/TripExperienceContext";

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 3, 5],
    Forest: [8, 3, 5],
};

function DemoContent() {
    const { selectedScene, strength, setStrength } = useTripExperience();

    return (
        <>
            <div className="absolute">
                <div className="absolute top-4 left-4 z-10 flex flex-col">
                    <TripSelection />
                    <SceneSelection />

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
                    initialCameraPos={InitialPositions[TripScene.Metro]}
                />
                <SceneRenderer />
                <EffectRenderer />
            </Canvas>
        </>
    );
}

export default function MetroPage() {
    return (
        <TripExperienceProvider>
            <DemoContent />
        </TripExperienceProvider>
    );
}
