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
import { withHighlight } from '../../../hoc/withHighlight';

type Props = {
  children?: React.ReactNode;
  hideText: string;
  showText: string;
};

type States = {
  isShow: boolean;
};

const StyledContent = styled.div`
  ${typography('body1')};
  color: ${grey('500')};
  margin-bottom: ${spacing(1)};
`;

const StyledToggle = styled.div`
  display: inline-block;
  ${typography('body1')};
  color: ${primary('main')};
  text-decoration: underline;
  cursor: pointer;
`;

class JuiEventCollapse extends React.PureComponent<Props, States> {
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
    const { children, hideText, showText } = this.props;
    const { isShow } = this.state;
    return (
      <Fragment>
        {isShow && children}
        <StyledToggle onClick={this.handleToggle}>
          {isShow ? hideText : showText}
        </StyledToggle>
      </Fragment>
    );
  }
}

const JuiEventCollapseContent = withHighlight(['children'])(props => {
  return <StyledContent {...props} />;
});

export { JuiEventCollapse, JuiEventCollapseContent };
