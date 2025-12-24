"use client";

import { Trip, TripScene } from "@/lib/types";
import {
    createContext,
    useContext,
    useRef,
    useState,
    ReactNode,
    RefObject,
} from "react";
import { Mesh } from "three";

interface TripExperienceContextType {
    selectedTrip: Trip;
    setSelectedTrip: (trip: Trip) => void;
    selectedScene: TripScene;
    setSelectedScene: (scene: TripScene) => void;
    strength: number;
    setStrength: (strength: number) => void;
    collidersRef: RefObject<Mesh[]>;
}

const TripExperienceContext = createContext<
    TripExperienceContextType | undefined
>(undefined);

export function TripExperienceProvider({ children }: { children: ReactNode }) {
    const [selectedTrip, setSelectedTrip] = useState<Trip>(Trip.NONE);
    const [selectedScene, setSelectedScene] = useState<TripScene>(
        TripScene.Metro
    );
    const [strength, setStrength] = useState<number>(1);
    const collidersRef = useRef<Mesh[]>([]);

    return (
        <TripExperienceContext.Provider
            value={{
                selectedTrip,
                setSelectedTrip,
                selectedScene,
                setSelectedScene,
                strength,
                setStrength,
                collidersRef,
            }}
        >
            {children}
        </TripExperienceContext.Provider>
    );
}

export function useTripExperience() {
    const context = useContext(TripExperienceContext);
    if (context === undefined) {
        throw new Error(
            "useTripExperience must be used within a TripExperienceProvider"
        );
    }
    return context;
}
