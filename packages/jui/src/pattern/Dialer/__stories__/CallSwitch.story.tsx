/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-07-23 14:24:06
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { JuiSnackbarContent } from '../../../components/Snackbars';
import { JuiModal } from '../../../components/Dialog';
import { JuiCallSwitch } from '..';
import { JuiButton } from '../../../components/Buttons';

const openCallSwitch = () => {};

const CallSwitch = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <JuiButton variant="text" onClick={() => setOpen(true)} color="action">
        Switch call to this device
      </JuiButton>
      <JuiModal
        open={open}
        title="Transfer call"
        onOK={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        okText="Switch"
        cancelText="Cancel"
        size="small"
        okType="primary"
        content={<JuiCallSwitch message="You're currently on an active call with [contact name/phone number]. Would you like to continue the call on this device?" />}
      />
    </>
  );
};

storiesOf('Pattern', module).add('Call Switch', () => {
  return (
    <JuiSnackbarContent
      type="success"
      message="You're currently on an active call on another device."
      messageAlign="center"
      action={<CallSwitch />}
      fullWidth
    />
  );
});
