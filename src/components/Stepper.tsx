import React from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center mb-6" aria-label="Progreso">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div
            className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              index + 1 <= currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 ${index + 1 < currentStep ? 'bg-primary' : 'bg-muted'}`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

