/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 08:51:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactElement } from 'react';
import { JuiListItemText } from '../../../components/Lists';
import { Wrapper, IconWrapper } from './styles';
import { JuiIconography } from '../../../foundation/Iconography';
import { FileName } from '../../ConversationCard/Files/FileName';

type JuiPinnedItemProps = {
  icon: string | ReactElement<any>;
  isFile: boolean;
  text: string;
  id: number;
};

class JuiPinnedItem extends Component<JuiPinnedItemProps> {
  render() {
    const { icon, text, isFile } = this.props;
    let iconElement = icon;
    if (typeof icon === 'string') {
      iconElement = (
        <JuiIconography iconSize="inherit" iconColor={['grey', '500']}>
          {icon}
        </JuiIconography>
      );
    }
    return (
      <Wrapper>
        <IconWrapper data-test-automation-id="pinned-item-icon">
          {iconElement}
        </IconWrapper>
        {isFile ? (
          <FileName filename={text} />
        ) : (
          <JuiListItemText
            data-test-automation-id="pinned-item-text"
            primary={text}
          />
        )}
      </Wrapper>
    );
  }
}

export { JuiPinnedItem, JuiPinnedItemProps };
