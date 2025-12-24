import { Button } from "./ui/button";
import { TripScene } from "@/lib/types";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTripExperience } from "./TripExperienceContext";

export default function SceneSelection() {
    const { selectedScene, setSelectedScene } = useTripExperience();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="mt-2">
                    Change Scene 🌲
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Scene</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <>
                    {Object.values(TripScene).map((scene) => (
                        <DropdownMenuCheckboxItem
                            key={scene}
                            checked={scene === selectedScene}
                            onCheckedChange={() => setSelectedScene(scene)}
                        >
                            {scene}
                        </DropdownMenuCheckboxItem>
                    ))}
                </>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
