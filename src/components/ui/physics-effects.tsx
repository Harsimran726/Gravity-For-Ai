'use client';

import * as React from 'react';
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  type Variants,
} from 'framer-motion';

// ─────────────────────────────────────────────
// 1. ZERO GRAVITY FLOAT (infinite ambient float)
// ─────────────────────────────────────────────
export function ZeroGravity({ 
  children, 
  className = '', 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{
        y: [-15, 15, -15],
        x: [-5, 5, -5],
        rotate: [-1.5, 1.5, -1.5],
      }}
      transition={{
        duration: 12,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsTouch(
        typeof window !== 'undefined' &&
        (window.innerWidth < 768 ||
         window.matchMedia('(pointer: coarse)').matches ||
         'ontouchstart' in window)
      );
    };
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return isTouch;
}

// ─────────────────────────────────────────────
// 2. HEAVY DRAGGABLE (drag + falling spring snap)
// ─────────────────────────────────────────────
export function HeavyDraggable({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string;
}) {
  const isTouch = useIsTouchDevice();

  // On mobile touch devices, disable drag completely to allow native, effortless vertical scrolling
  if (isTouch) {
    return <div className={`touch-pan-y ${className}`}>{children}</div>;
  }

  return (
    <motion.div
      className={`cursor-grab active:cursor-grabbing ${className}`}
      drag
      dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
      dragElastic={0.08}
      whileDrag={{ 
        scale: 1.01, 
        rotate: 1,
        boxShadow: '0px 20px 40px rgba(0,0,0,0.2)',
      }}
      whileTap={{ cursor: 'grabbing' }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 8,
        mass: 5,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 3. SCROLL REVEAL (fade-up when enters viewport)
// ─────────────────────────────────────────────
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: 'blur(4px)' },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delay: delay ?? 0,
    },
  }),
};

export function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px 0px' });

  const directionOffset =
    direction === 'left' ? { x: -50, y: 0 } :
    direction === 'right' ? { x: 50, y: 0 } :
    { x: 0, y: 40 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionOffset, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, filter: 'blur(0px)' } : {}}
      transition={{
        duration: 0.75,
        ease: [0.22, 1, 0.36, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 4. PARALLAX SECTION (depth shift on scroll)
// ─────────────────────────────────────────────
export function ParallaxLayer({
  children,
  className = '',
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number; // 0 = no parallax, 1 = moves with scroll
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const rawY = useTransform(scrollYProgress, [0, 1], [`${-speed * 60}px`, `${speed * 60}px`]);
  const y = useSpring(rawY, { stiffness: 60, damping: 18 });

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 5. GRAVITY PULL (hover wobble like gravity attraction)
// ─────────────────────────────────────────────
export function GravityPull({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const isTouch = useIsTouchDevice();

  // On mobile touch devices, disable hover and tap animations so boxes do not jump or conflict with scrolling
  if (isTouch) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{
        scale: 1.04,
        y: -6,
        rotate: 0.8,
        transition: { type: 'spring', stiffness: 300, damping: 15 },
      }}
      whileTap={{
        scale: 0.97,
        y: 2,
        transition: { type: 'spring', stiffness: 400, damping: 20 },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// 6. STAGGER CONTAINER (stagger children reveal)
// ─────────────────────────────────────────────
export function StaggerReveal({
  children,
  className = '',
  stagger = 0.12,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
            visible: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}


