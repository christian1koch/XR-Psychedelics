import { ForestModel } from "@/app/demo/ForestModel";
import { MetroModel } from "@/app/demo/MetroModel";
import { TripScene } from "@/lib/types";
import { Group, Mesh } from "three";
import { useTripExperience } from "./TripExperienceContext";

export default function SceneRenderer() {
    const { selectedScene, collidersRef } = useTripExperience();
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
            {selectedScene === TripScene.Metro && (
                <MetroModel ref={modelRefCallback} />
            )}
            {selectedScene === TripScene.Forest && (
                <ForestModel ref={modelRefCallback} />
            )}
        </>
    );
}
