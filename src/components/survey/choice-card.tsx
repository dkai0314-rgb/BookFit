import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ChoiceCardProps {
    label: string;
    selected: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}

export function ChoiceCard({ label, selected, onClick, icon }: ChoiceCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "relative flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md",
                selected
                    ? "border-secondary bg-secondary/5 shadow-md"
                    : "border-border bg-card hover:border-secondary/50"
            )}
        >
            {selected && (
                <div className="absolute top-3 right-3 text-secondary">
                    <Check className="w-5 h-5" />
                </div>
            )}
            {icon && <div className="mb-3 text-primary">{icon}</div>}
            <span
                className={cn(
                    "font-medium text-center",
                    selected ? "text-primary font-bold" : "text-muted-foreground"
                )}
            >
                {label}
            </span>
        </div>
    );
}
