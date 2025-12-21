"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";
import { ThreeElements } from "@react-three/fiber";
import { Group } from "three";

type ForestModelProps = ThreeElements["group"] & {
    ref?: React.Ref<Group>;
};

export function ForestModel({ ref, ...props }: ForestModelProps) {
    const { nodes, materials } = useGLTF("/pine_forest.glb") as any;
    return (
        <group {...props} dispose={null} ref={ref}>
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_4.geometry}
                material={materials.pine}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_6.geometry}
                material={materials.mat1}
            />
            <mesh
                castShadow
                receiveShadow
                geometry={nodes.Object_8.geometry}
                material={materials.mat2}
            />
        </group>
    );
}
