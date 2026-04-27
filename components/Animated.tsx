'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedPageProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
}

export function AnimatedPage({ children, delay = 0, ...props }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
}

export function AnimatedCard({ children, delay = 0, ...props }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedListProps {
  children: ReactNode
  staggerDelay?: number
}

export function AnimatedList({ children, staggerDelay = 0.05 }: AnimatedListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedListItem({ children, ...props }: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 6 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode
  delay?: number
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}