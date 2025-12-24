import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Trip } from "@/lib/types";
import { useTripExperience } from "./TripExperienceContext";

export default function TripSelection() {
    const { selectedTrip, setSelectedTrip } = useTripExperience();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">Change Trip 💊</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <>
                    {Object.values(Trip).map((trip) => (
                        <DropdownMenuCheckboxItem
                            key={trip}
                            checked={trip === selectedTrip}
                            onCheckedChange={() => setSelectedTrip(trip)}
                        >
                            {trip}
                        </DropdownMenuCheckboxItem>
                    ))}
                </>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
