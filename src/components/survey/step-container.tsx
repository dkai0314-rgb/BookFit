import { motion, AnimatePresence } from "framer-motion";

interface StepContainerProps {
    children: React.ReactNode;
    step: number;
}

export function StepContainer({ children, step }: StepContainerProps) {
    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
