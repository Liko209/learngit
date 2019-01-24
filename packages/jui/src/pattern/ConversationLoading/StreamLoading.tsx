/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-22 16:23:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import {
  palette,
  width,
  height,
  spacing,
  typography,
  grey,
} from '../../foundation/utils';
import { JuiTypography } from '../../foundation/Typography';
import { JuiCircularProgress } from '../../components/Progress';
import { JuiLink } from '../../components/Link';

const Progress = styled(JuiCircularProgress)`
  && {
    width: ${width(11)} !important;
    height: ${height(11)} !important;
    svg {
      width: ${width(11)};
      height: ${height(11)};
    }
  }
  margin: ${spacing(4)};
`;

const Loading = styled.div`
  position: relative;
  background: ${palette('common', 'white')};
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const Tip = styled(JuiTypography)`
  ${typography('body1')};
  color: ${grey('900dark')};
`;
const TipLink = styled(JuiLink)`
  ${typography('body2')};
`;

type JuiConversationLoadingProps = {
  tip?: string;
  linkText?: string;
  showTip?: boolean;
  onClick?: () => void;
};

type State = {
  showLink: boolean;
};

class JuiStreamLoading extends React.Component<
  JuiConversationLoadingProps,
  State
> {
  timer: NodeJS.Timeout;
  showLinkTimer: NodeJS.Timeout;

  readonly state = {
    showLink: true,
  };

  static defaultProps = {
    showTip: false,
  };

  componentWillReceiveProps(props: JuiConversationLoadingProps) {
    if (props.showTip) {
      this.showLinkTimer = setTimeout(() => {
        this.setState({
          showLink: true,
        });
      },                              1000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    clearTimeout(this.showLinkTimer);
  }

  onClick = () => {
    const { onClick } = this.props;
    this.setState({
      showLink: false,
    });
    onClick && onClick();
  }

  render() {
    const { showLink } = this.state;
    const { tip, linkText, showTip } = this.props;

    return (
      <Loading>
        <Progress />
        {showTip && (
          <Tip>
            {tip}
            {showLink && (
              <TipLink handleOnClick={this.onClick}>{linkText}</TipLink>
            )}
          </Tip>
        )}
      </Loading>
    );
  }
}

export { Loading, Progress, Tip, TipLink, JuiStreamLoading };
