/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 14:51:04
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Fragment } from 'react';
import styled from '../../../foundation/styled-components';
import {
  typography,
  grey,
  primary,
  spacing,
} from '../../../foundation/utils/styles';

type historyItem = {
  text: string;
};

type Props = {
  history: historyItem[];
};

type States = {
  isShow: boolean;
};

// const StyledEventCollapse = styled.div`
//   width: 100%;
//   background: ${grey('100')};
//   padding: ${spacing(4)} 0 ${spacing(4)} ${spacing(10)};
// `;

const StyledContent = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
  margin-bottom: ${spacing(1)};
`;

const StyledToggle = styled.div`
  ${typography('body1')};
  color: ${primary('main')};
  text-decoration: underline;
  cursor: pointer;
`;

class JuiEventCollapse extends React.Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isShow: false,
    };
  }

  handleToggle = () => {
    this.setState({ isShow: !this.state.isShow });
  }

  render() {
    const { history } = this.props;
    const { isShow } = this.state;
    return (
      <Fragment>
        {isShow && <StyledContent>{history[0].text}</StyledContent>}
        <StyledToggle onClick={this.handleToggle}>
          {isShow ? 'Hide' : 'Show old'}
        </StyledToggle>
      </Fragment>
    );
  }
}

export { JuiEventCollapse };
