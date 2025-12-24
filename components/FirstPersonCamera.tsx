"use client";
import { PointerLockControls } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useRef, useEffect } from "react";
import { Vector3, Raycaster } from "three";
import { useTripExperience } from "./TripExperienceContext";

export function FirstPersonCamera({
    initialCameraPos,
}: {
    initialCameraPos: [number, number, number];
}) {
    const { collidersRef } = useTripExperience();
    const { camera } = useThree();
    const direction = useRef(new Vector3());
    const raycaster = useRef(new Raycaster());

    const moveState = useRef({
        forward: false,
        backward: false,
        left: false,
        right: false,
    });

    const SPEED = 5;
    const COLLISION_DISTANCE = 0.5;

    useEffect(() => {
        // Start inside the metro station
        camera.position.set(...initialCameraPos);

        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    moveState.current.forward = true;
                    break;
                case "KeyS":
                case "ArrowDown":
                    moveState.current.backward = true;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    moveState.current.left = true;
                    break;
                case "KeyD":
                case "ArrowRight":
                    moveState.current.right = true;
                    break;
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            switch (e.code) {
                case "KeyW":
                case "ArrowUp":
                    moveState.current.forward = false;
                    break;
                case "KeyS":
                case "ArrowDown":
                    moveState.current.backward = false;
                    break;
                case "KeyA":
                case "ArrowLeft":
                    moveState.current.left = false;
                    break;
                case "KeyD":
                case "ArrowRight":
                    moveState.current.right = false;
                    break;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [camera, initialCameraPos]);

    useFrame((_, delta) => {
        const { forward, backward, left, right } = moveState.current;

        // Get camera direction
        direction.current.set(0, 0, 0);

        const frontVector = new Vector3(
            0,
            0,
            Number(backward) - Number(forward)
        );
        const sideVector = new Vector3(Number(left) - Number(right), 0, 0);

        direction.current
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED * delta)
            .applyEuler(camera.rotation);

        // Only move horizontally (no flying)
        direction.current.y = 0;

        // Check collision before moving
        if (direction.current.length() > 0 && collidersRef.current.length > 0) {
            const newPosition = camera.position.clone().add(direction.current);

            // Cast rays in movement direction
            raycaster.current.set(
                camera.position,
                direction.current.clone().normalize()
            );
            const intersects = raycaster.current.intersectObjects(
                collidersRef.current,
                true
            );

            if (
                intersects.length === 0 ||
                intersects[0].distance > COLLISION_DISTANCE
            ) {
                camera.position.copy(newPosition);
            }
        }
    });

    return <PointerLockControls selector=".canvas" />;
}
