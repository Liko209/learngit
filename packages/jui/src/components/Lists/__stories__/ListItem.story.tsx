/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-03 15:45:31
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { text, boolean, select } from '@storybook/addon-knobs';
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
import download from '../../../assets/jupiter-icon/icon-download.svg';
import info from '../../../assets/jupiter-icon/icon-info.svg';
import star from '../../../assets/jupiter-icon/icon-star.svg';
import { JuiVirtualizedMenuList } from '../../VirtualizedMenus';
import _ from 'lodash';

class TwoLineItem extends React.PureComponent {
  state = {
    isHover: false,
  };
  handleMouseEnter = () => {
    this.setState({ isHover: true });
  };
  handleMouseLeave = () => {
    this.setState({ isHover: false });
  };
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
                symbol={download}
              />
            </JuiListItemIcon>
          </JuiListItemSecondaryAction>
        ) : (
          <JuiListItemSecondaryAction>
            <JuiIconButton variant="plain" disabled={disabled} symbol={info} />
          </JuiListItemSecondaryAction>
        )}
      </JuiListItem>
    );
  }
}

storiesOf('Components/Lists/ListItem', module)
  .add('list item', () => {
    const baseColor = select<any>(
      'baseColor',
      {
        primary: 'primary',
        secondary: 'secondary',
        black: 'black',
      },
      'black',
    );
    return (
      <JuiVirtualizedMenuList>
        {_.range(0, 10).map(k => (
          <JuiListItem key={k} singleLine baseColor={baseColor}>
            list item
          </JuiListItem>
        ))}
      </JuiVirtualizedMenuList>
    );
  })
  .add('Single-line item with Avatar and controls', () => {
    const primary = text('primary', 'Single-line item name');

    return (
      <JuiList>
        <JuiListItem singleLine>
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
        <JuiListItem singleLine>
          <JuiListItemIcon>
            <JuiIconButton
              variant="plain"
              tooltipTitle="favorite"
              symbol={star}
            />
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
