import React, { useState } from 'react';
import { CustomButton, CustomCard, CustomModal, CustomInput } from '@/components';

const ExamplePage = () => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Component Library Example</h2>
      <CustomButton onClick={() => setOpen(true)}>Open Modal</CustomButton>

      <CustomModal open={open} onClose={() => setOpen(false)} title="Custom Modal">
        <CustomInput label="Name" />
        <CustomButton onClick={() => setOpen(false)}>Close</CustomButton>
      </CustomModal>

      <CustomCard
        title="Card Title"
        content="This is an example of the reusable card component."
        actions={<CustomButton color="secondary">Action</CustomButton>}
      />
    </div>
  );
};

export default ExamplePage;