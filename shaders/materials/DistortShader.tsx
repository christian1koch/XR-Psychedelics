"use client";
import * as THREE from "three";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ThreeElement } from "@react-three/fiber";

// Create the shader material
export const WavyMaterial = shaderMaterial(
    // Uniforms
    {
        uTime: 0,
        uColor: new THREE.Color(0.2, 0.6, 1.0),
    },

    // Vertex Shader
    // Wave formula: float wave = sin(position.x * frequency + uTime * speed) * amplitude;
    `
  precision mediump float;


  uniform float uTime;

  void main() {

    float wave = sin(position.x * 2.0 + uTime * 2.0) * 0.5;

    vec3 newPosition = vec3(
      position.x + wave,
      position.y,
      position.z + wave
    );

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
  `,

    // Fragment Shader
    `
  precision mediump float;

  uniform vec3 uColor;

  void main() {
    gl_FragColor = vec4(uColor, 1.0);
  }
  `
);

extend({ WavyMaterial });

// Type for the WavyMaterial instance
type WavyMaterialImpl = THREE.ShaderMaterial & {
    uTime: number;
    uColor: THREE.Color;
};

// Extend ThreeElements to include wavyMaterial
declare module "@react-three/fiber" {
    interface ThreeElements {
        wavyMaterial: ThreeElement<typeof WavyMaterial>;
    }
}

export function WavyMaterialAnimated() {
    const materialRef = useRef<WavyMaterialImpl>(null);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
        }
    });

    return <wavyMaterial ref={materialRef} />;
}
