import { motion } from "framer-motion";

interface ProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full h-2 bg-secondary/20 rounded-full overflow-hidden">
            <motion.div
                className="h-full bg-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
}
