import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiActions } from '../Actions';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import refresh from '../../../../assets/jupiter-icon/icon-refresh.svg';
import deleteIcon from '../../../../assets/jupiter-icon/icon-delete.svg';

storiesOf('Pattern/ConversationCard', module).add('Actions', () => (
  <JuiActions>
    <JuiIconButton variant="plain" tooltipTitle="refresh" symbol={refresh} />
    <JuiIconButton variant="plain" tooltipTitle="delete" symbol={deleteIcon} />
  </JuiActions>
));
