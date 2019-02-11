/*
 * @Author: isaac.liu
 * @Date: 2019-02-02 08:51:54
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, ReactElement } from 'react';
import { JuiListItemText } from '../../../components/Lists';
import { Wrapper, IconWrapper } from './styles';
import { JuiIconography } from '../../../foundation/Iconography';

type JuiPinnedItemProps = {
  icon: string | ReactElement<any>;
  text: string;
};

class JuiPinnedItem extends Component<JuiPinnedItemProps> {
  render() {
    const { icon, text } = this.props;
    let iconElement = icon;
    if (typeof icon === 'string') {
      iconElement = <JuiIconography fontSize="inherit">{icon}</JuiIconography>;
    }
    return (
      <Wrapper>
        <IconWrapper>{iconElement}</IconWrapper>
        <JuiListItemText primary={text} />
      </Wrapper>
    );
  }
}

export { JuiPinnedItem, JuiPinnedItemProps };
