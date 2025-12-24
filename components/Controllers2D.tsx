"use client";

import { Slider } from "@/components/ui/slider";
import TripSelection from "@/components/TripSelection";
import SceneSelection from "@/components/SceneSeletion";
import { useTripExperience } from "@/components/TripExperienceContext";

export default function Controllers2D() {
    const { strength, setStrength } = useTripExperience();

    return (
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
    );
}
