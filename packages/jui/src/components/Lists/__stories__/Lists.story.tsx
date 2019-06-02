/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:37:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiIconography } from '../../../foundation/Iconography';
import { JuiDivider } from '../../Divider';
import { JuiIconButton } from '../../Buttons/IconButton';
import {
  JuiList,
  JuiListItem,
  JuiListItemIcon,
  JuiListItemText,
  JuiListItemSecondaryAction,
} from '../index';
import inbox from '../../../assets/jupiter-icon/icon-inbox.svg';
import draft from '../../../assets/jupiter-icon/icon-draft.svg';

storiesOf('Components/Lists', module)
  .addDecorator(withInfoDecorator(JuiList, { inline: true }))
  .add('Simple List', () => (
    <div>
      <JuiList>
        <JuiListItem button={true}>
          <JuiListItemIcon>
            <JuiIconography symbol={inbox} />
          </JuiListItemIcon>
          <JuiListItemText primary="Inbox" />
        </JuiListItem>
        <JuiListItem button={true}>
          <JuiListItemIcon>
            <JuiIconography symbol={draft} />
          </JuiListItemIcon>
          <JuiListItemText primary="Drafts" />
        </JuiListItem>
      </JuiList>
      <JuiDivider />
      <JuiList>
        <JuiListItem button={true}>
          <JuiListItemText primary="Trash" />
        </JuiListItem>
        <JuiListItem button={true}>
          <JuiListItemText primary="Spam" />
        </JuiListItem>
      </JuiList>
    </div>
  ))
  .add('List Controls', () => (
    <div>
      <JuiList>
        {[0, 1, 2, 3].map(value => (
          <JuiListItem key={value} button={true}>
            <JuiListItemText primary={`Line item ${value + 1}`} />
            <JuiListItemSecondaryAction>
              <JuiIconButton
                size="small"
                aria-label="Comments"
                symbol={inbox}
              />
            </JuiListItemSecondaryAction>
          </JuiListItem>
        ))}
      </JuiList>
    </div>
  ));
