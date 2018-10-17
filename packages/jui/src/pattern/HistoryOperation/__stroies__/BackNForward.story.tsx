/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-30 14:45:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiHistoryOperation, OPERATION } from '../index';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

const items = [
  { title: 'back and forwards', pathname: '' },
  { title: '12345', pathname: '' },
];
storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiHistoryOperation, { inline: true }))
  .add('BackNForward', () => {
    return (
      <div style={{ display: 'flex' }}>
        <JuiHistoryOperation
          tooltipTitle="Back"
          menu={items}
          open={true}
          disabled={false}
          type={OPERATION.BACK}
          onClick={() => {}}
          onLongPress={() => {}}
          onClickMenu={() => {}}
          onClickAway={() => {}}
        />
        <JuiHistoryOperation
          tooltipTitle="Forward"
          type={OPERATION.FORWARD}
          menu={items}
          open={false}
          disabled={false}
          onClick={() => {}}
          onLongPress={() => {}}
          onClickMenu={() => {}}
          onClickAway={() => {}}
        />
      </div>
    );
  });
