import React from 'react';
import styles from  './index.module.scss';

interface TimelineProps {
  steps: string[];
  currentStep: number;
}

export const Timeline: React.FC<TimelineProps> = ({ steps, currentStep }) => {
  return (
    <div className={styles.timeline}>
      {steps.map((step, index) => (
        <div
          key={index}
          className={`${styles.timelineStep} ${index + 1 === currentStep ? styles.active : ''} ${
            index + 1 < currentStep ? styles.completed : ''
          }`}
        >
          <div className={styles.timelineStepNumber}>{index + 1}</div>
          <div className={styles.timelineStepLabel}>{step}</div>
        </div>
      ))}
    </div>
  );
};