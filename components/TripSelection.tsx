import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { SelectionProps, Trip } from "@/lib/types";

export default function TripSelection({
    selectedItem: selectedTrip,
    onItemSelect: setSelectedTrip,
}: SelectionProps<Trip>) {
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
