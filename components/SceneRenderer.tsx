import { ForestModel } from "@/app/demo/ForestModel";
import { MetroModel } from "@/app/demo/MetroModel";
import { TripScene } from "@/lib/types";
import { RefObject } from "react";
import { Group, Mesh } from "three";

export default function SceneRenderer({
    selectedScene,
    collidersRef,
}: {
    selectedScene: TripScene;
    collidersRef: RefObject<Mesh[]>;
}) {
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
