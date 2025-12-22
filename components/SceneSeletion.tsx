import { Button } from "./ui/button";
import { TripScene, SelectionProps } from "@/lib/types";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function SceneSelection({
    onItemSelect,
    selectedItem,
}: SelectionProps<TripScene>) {
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
                            checked={scene === selectedItem}
                            onCheckedChange={() => onItemSelect(scene)}
                        >
                            {scene}
                        </DropdownMenuCheckboxItem>
                    ))}
                </>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
