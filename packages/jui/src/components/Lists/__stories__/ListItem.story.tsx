/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-03 15:45:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean } from '@storybook/addon-knobs';
import { JuiIconButton } from '../../Buttons/IconButton';
import { JuiThumbnail } from '../../Thumbnail';
import { JuiAvatar } from '../../Avatar';
import { JuiToggleButton } from '../../Buttons';
import {
  JuiList,
  JuiListItemText,
  JuiListItem,
  JuiListItemAvatar,
  JuiListItemIcon,
  JuiListItemSecondaryAction,
} from '../index';
import avatar from '../../Avatar/__stories__/img/avatar.jpg';

class TwoLineItem extends React.PureComponent {
  state = {
    isHover: false,
  };
  handleMouseEnter = () => {
    this.setState({ isHover: true });
  }
  handleMouseLeave = () => {
    this.setState({ isHover: false });
  }
  render() {
    const primary = text('primary', 'Two-line item name');
    const secondaryText = text('secondaryText', 'Secondary text');
    const secondaryDate = text('secondaryDate', 'XX/XX/XXXX');
    const disabled = boolean('disabled', false);
    const { isHover } = this.state;
    return (
      <JuiListItem
        disabled={disabled}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <JuiListItemIcon>
          <JuiThumbnail iconType="pdf" />
        </JuiListItemIcon>
        <JuiListItemText
          primary={primary}
          secondary={
            <span>
              <span>{secondaryText}</span>
              <span> · {secondaryDate}</span>
            </span>
          }
        />
        {isHover ? (
          <JuiListItemSecondaryAction>
            <JuiListItemIcon>
              <JuiIconButton
                variant="plain"
                tooltipTitle="Download"
                disabled={disabled}
              >
                get_app
              </JuiIconButton>
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        ) : (
          <JuiListItemSecondaryAction>
            <JuiIconButton variant="plain" disabled={disabled}>
              info
            </JuiIconButton>
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

storiesOf('Components/Lists/ListItem', module)
  // .addDecorator(withInfoDecorator(JuiListItem, { inline: true }))
  .add('Single-line item with Avatar and controls', () => {
    const primary = text('primary', 'Single-line item name');

    return (
      <JuiList>
        <JuiListItem singleLine={true}>
          <JuiListItemAvatar>
            <JuiAvatar size="small" src={avatar} />
          </JuiListItemAvatar>
          <JuiListItemText primary={primary} />
          <JuiListItemSecondaryAction>
            <JuiToggleButton />
          </JuiListItemSecondaryAction>
        </JuiListItem>
      </JuiList>
    );
  })
  .add('Single-line item with icon', () => {
    const primary = text('primary', 'Single-line item name');

    return (
      <JuiList>
        <JuiListItem singleLine={true}>
          <JuiListItemIcon>
            <JuiIconButton variant="plain" tooltipTitle="favorite">
              favorite
            </JuiIconButton>
          </JuiListItemIcon>
          <JuiListItemText primary={primary} />
        </JuiListItem>
      </JuiList>
    );
  })
  .add('Two-line item', () => {
    return (
      <JuiList>
        <TwoLineItem />
      </JuiList>
    );
  })
  .add('List', () => {
    return (
      <JuiList>
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
        <TwoLineItem />
      </JuiList>
    );
  });
