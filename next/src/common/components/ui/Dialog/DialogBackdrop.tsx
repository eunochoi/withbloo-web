'use client';

import { motion, type Transition } from 'framer-motion';

interface DialogBackdropProps {
  onClick: () => void;
  transition: Transition;
}

export const DialogBackdrop = ({ onClick, transition }: DialogBackdropProps) => (
  <motion.div
    aria-hidden="true"
    className="absolute inset-0 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, pointerEvents: 'none' }}
    transition={transition}
    onClick={onClick}
  />
);
