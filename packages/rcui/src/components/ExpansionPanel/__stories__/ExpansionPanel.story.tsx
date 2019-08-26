/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-27 13:52:08
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { boolean } from '@storybook/addon-knobs';
import { JuiExpansionPanel } from '../ExpansionPanel';
import { JuiExpansionPanelSummary } from '../ExpansionPanelSummary';
import { JuiExpansionPanelDetails } from '../ExpansionPanelDetails';
import { JuiIconButton } from '../../Buttons/IconButton';

storiesOf('Components/ExpansionPanel', module).add('JuiExpansionPanel', () => {
  const square = boolean('square', true);

  return (
    <div>
      <JuiExpansionPanel square={square}>
        <JuiExpansionPanelSummary
          expandIcon={<JuiIconButton>arrow_up</JuiIconButton>}
        >
          Expansion Panel 1
        </JuiExpansionPanelSummary>
        <JuiExpansionPanelDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </JuiExpansionPanelDetails>
      </JuiExpansionPanel>
      <JuiExpansionPanel square={square}>
        <JuiExpansionPanelSummary
          expandIcon={<JuiIconButton>arrow_up</JuiIconButton>}
        >
          Expansion Panel 1
        </JuiExpansionPanelSummary>
        <JuiExpansionPanelDetails>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
          malesuada lacus ex, sit amet blandit leo lobortis eget.
        </JuiExpansionPanelDetails>
      </JuiExpansionPanel>
    </div>
  );
});
