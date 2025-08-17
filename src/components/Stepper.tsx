import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="flex items-center mb-6" aria-label="Progreso">
      {steps.map((step, index) => {
        const isComplete = index + 1 < currentStep;
        const isActive = index + 1 <= currentStep;

        return (
          <React.Fragment key={step}>
            <motion.div
              className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
              animate={
                shouldReduceMotion
                  ? {}
                  : {
                      backgroundColor: isActive
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted))',
                      color: isActive
                        ? 'hsl(var(--primary-foreground))'
                        : 'hsl(var(--muted-foreground))',
                    }
              }
              style={
                shouldReduceMotion
                  ? {
                      backgroundColor: isActive
                        ? 'hsl(var(--primary))'
                        : 'hsl(var(--muted))',
                      color: isActive
                        ? 'hsl(var(--primary-foreground))'
                        : 'hsl(var(--muted-foreground))',
                    }
                  : undefined
              }
              transition={{ duration: 0.3 }}
            >
              {index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div
                className="flex-1 h-1 bg-muted rounded"
                aria-hidden="true"
              >
                <motion.div
                  className="h-full bg-primary rounded"
                  initial={false}
                  animate={
                    shouldReduceMotion ? {} : { width: isComplete ? '100%' : '0%' }
                  }
                  style={
                    shouldReduceMotion
                      ? { width: isComplete ? '100%' : '0%' }
                      : undefined
                  }
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

