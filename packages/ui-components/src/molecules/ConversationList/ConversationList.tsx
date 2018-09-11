/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-17 10:34:45
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../styled-components';

import MuiMenuList from '@material-ui/core/MenuList';

const StyledList = styled(MuiMenuList)`
  && {
    background-color: white;
    padding-top: 0;
    padding-bottom: 0;
  }
`;

type ListProps = {
  className?: string;
  onClick?: Function;
  onChange?: Function;
};

class ConversationList extends PureComponent<ListProps> {
  static dependencies: React.ComponentType[];
  constructor(props: ListProps) {
    super(props);

    this._handleChange = this._handleChange.bind(this);
  }

  render() {
    return (
      <StyledList
        component="div"
        onClick={this._handleChange}
      >
        {this.props.children}
      </StyledList>
    );
  }

  /**
   * TODO use the same way with <BottomNavigation/> to implement onChange event.
   * See https://bit.ly/2Bf2sP0
   */
  private _handleChange(event: React.MouseEvent) {
    const { onChange, onClick } = this.props;

    if (onChange) {
      onChange(event, this._findIndex(event.target));
    }

    if (onClick) {
      onClick(event);
    }
  }

  private _findIndex(el: any) {
    if (!el.parentElement) return -1;
    return Array.from(el.parentElement.children).indexOf(el);
  }
}

ConversationList.dependencies = [MuiMenuList];

export default ConversationList;
export { ListProps, ConversationList };
