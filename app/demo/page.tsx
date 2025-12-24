"use client";
import { Canvas } from "@react-three/fiber";
import { FirstPersonCamera } from "@/components/FirstPersonCamera";
import { TripScene, SceneInitialPositions } from "@/lib/types";
import {
    TripExperienceProvider,
    useTripExperience,
} from "@/components/TripExperienceContext";
import Controllers2D from "@/components/Controllers2D";
import SceneContent from "@/components/SceneContent";

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 3, 5],
    Forest: [8, 3, 5],
};

function DemoContent() {
    const { selectedScene } = useTripExperience();

    return (
        <>
            <Controllers2D />
            <Canvas
                className="canvas"
                camera={{ fov: 75, near: 0.1, far: 1000 }}
            >
                <FirstPersonCamera
                    key={selectedScene}
                    initialCameraPos={InitialPositions[TripScene.Metro]}
                />
                <SceneContent />
            </Canvas>
        </>
    );
}

export default function DemoPage() {
    return (
        <TripExperienceProvider>
            <DemoContent />
        </TripExperienceProvider>
    );
}
