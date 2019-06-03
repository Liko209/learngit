/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiHistoryOperation, OPERATION } from '../index';

const items = [
  { title: 'back and forwards', pathname: '' },
  { title: '12345', pathname: '' },
];
storiesOf('Pattern', module).add('BackNForward', () => {
  return (
    <div style={{ display: 'flex' }}>
      <JuiHistoryOperation
        tooltipTitle="Back"
        menu={items}
        disabled={false}
        type={OPERATION.BACK}
        onClick={() => {}}
        onClickMenu={() => {}}
      />
      <JuiHistoryOperation
        tooltipTitle="Forward"
        type={OPERATION.FORWARD}
        menu={items}
        disabled={false}
        onClick={() => {}}
        onClickMenu={() => {}}
      />
    </div>
  );
});
