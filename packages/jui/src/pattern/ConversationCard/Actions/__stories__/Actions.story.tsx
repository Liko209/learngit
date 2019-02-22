import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiActions } from '../Actions';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';

storiesOf('Pattern/ConversationCard', module)
  .addDecorator(withInfoDecorator(JuiActions, { inline: true }))
  .add('Actions', () => (
    <JuiActions>
      <JuiIconButton variant="plain" tooltipTitle="refresh">
        refresh
      </JuiIconButton>
      <JuiIconButton variant="plain" tooltipTitle="delete">
        delete
      </JuiIconButton>
    </JuiActions>
  ));
