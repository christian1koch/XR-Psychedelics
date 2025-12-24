"use client";
import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, XROrigin } from "@react-three/xr";
import { TripScene, SceneInitialPositions } from "@/lib/types";
import SceneContent from "@/components/SceneContent";
import { TripExperienceProvider } from "@/components/TripExperienceContext";
import Controllers2D from "@/components/Controllers2D";

const store = createXRStore();

const InitialPositions: SceneInitialPositions = {
    Metro: [8, 2.5, 5],
    Forest: [8, 2.5, 5],
};

export default function App() {
    return (
        <TripExperienceProvider>
            <Controllers2D />
            <div className="absolute top-4 right-4 z-10">
                <button
                    className="rounded bg-white p-2 text-black"
                    onClick={() => store.enterVR()}
                >
                    Enter VR
                </button>
            </div>
            <Canvas>
                <XR store={store}>
                    <XROrigin position={InitialPositions[TripScene.Metro]} />
                    <SceneContent />
                </XR>
            </Canvas>
        </TripExperienceProvider>
    );
}
