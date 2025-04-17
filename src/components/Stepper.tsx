import { useEffect } from 'react';
import { Stepper, Space } from '@mantine/core';
import { unstable_usePrompt } from 'react-router';

import DropzoneButton from '../dropzone/Dropzone';
import ReviewSubmission from './ReviewSubmission';
import { OrbisData } from './OrbisData';
import Results from './Results';
import { useAppContext } from '../contextAPI/AppContext';

export default function Steps() {
  const { activeStep, setActiveStep } = useAppContext();

  const nextStep = () => {
    const step = activeStep < 4 ? activeStep + 1 : activeStep;
    setActiveStep(step);
  };

  unstable_usePrompt({
    message:
      'You’re in the middle of a process. Leaving now will discard your progress. Continue?',
    when: ({ currentLocation, nextLocation }) =>
      activeStep !== 0 &&
      activeStep < 3 &&
      currentLocation.pathname !== nextLocation.pathname,
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeStep !== 0 && activeStep < 3) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeStep]);

  return (
    <Stepper active={activeStep} my="xl" wrap={false}>
      <Stepper.Step
        label="Upload Entities"
        description="Import your Entity list to get started"
      >
        <Space h="xl" />
        <DropzoneButton nextStep={nextStep} />
      </Stepper.Step>
      <Stepper.Step
        label="Review Submission"
        description="Confirm and finalize the uploaded list"
      >
        <Space h="xl" />
        <ReviewSubmission nextStep={nextStep} />
        <Space h="xl" />
      </Stepper.Step>
      <Stepper.Step
        label="Entity Name Validation"
        description="Accept/Reject Suggestions"
      >
        <Space h="xl" />
        <OrbisData nextStep={nextStep} />
        <Space h="xl" />
      </Stepper.Step>
      <Stepper.Step
        label="Review Results"
        description="View detailed results and download reports"
      >
        <Results />
        <Space h="xl" />
      </Stepper.Step>
    </Stepper>
  );
}
