'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back';
}

export default function PageTransition({ children, direction = 'forward' }: PageTransitionProps) {
  const variants = {
    initial: {
      x: direction === 'forward' ? '100%' : '-100%',
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    exit: {
      x: direction === 'forward' ? '-100%' : '100%',
      opacity: 0,
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}
