import { useState } from 'react';
import { Stepper, Space } from '@mantine/core';
import DropzoneButton from '../dropzone/Dropzone';
import ReviewSubmission from './ReviewSubmission';
import { OrbisData } from './OrbisData';
import Results from './Results';
import { useAppContext } from '../contextAPI/AppContext';

export default function Steps() {
  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const { sessionId } = useAppContext();

  return (
    <Stepper active={active} my='xl' wrap={false} onStepClick={setActive}>
      <Stepper.Step
        label='Upload Suppliers'
        description='Import your supplier list to get started'
      >
        <Space h='xl' />
        <DropzoneButton nextStep={nextStep} />
      </Stepper.Step>
      <Stepper.Step
        label='Review Submission'
        description='Confirm and finalize the uploaded list'
      >
        <Space h='xl' />
        <ReviewSubmission nextStep={nextStep} />
      </Stepper.Step>
      <Stepper.Step
        label='Supplier Name Validation'
        description='Accept/Reject Suggestions'
      >
        <Space h='xl' />
        <OrbisData nextStep={nextStep} />
      </Stepper.Step>
      <Stepper.Step
        label='Review Results'
        description='View detailed results and download reports'
      >
        <Results />
      </Stepper.Step>
    </Stepper>
  );
}
