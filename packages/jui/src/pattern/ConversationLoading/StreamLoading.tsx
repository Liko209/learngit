/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-22 16:23:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import {
  palette,
  spacing,
  typography,
  grey,
  width,
  height,
} from '../../foundation/utils';
import { JuiTypography } from '../../foundation/Typography';
import { RuiCircularProgress } from 'rcui/components/Progress';
import { JuiLink } from '../../components/Link';

const Progress = styled(RuiCircularProgress)`
  && {
    width: ${width(6)} !important;
    height: ${height(6)} !important;
    svg {
      width: ${width(6)};
      height: ${height(6)};
    }
  }
  margin: ${spacing(4)};
`;

const Loading = styled.div`
  position: absolute;
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
  color: ${grey('900')};
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

class JuiStreamLoading extends React.PureComponent<
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

  componentDidUpdate(props: JuiConversationLoadingProps) {
    if (props.showTip) {
      this.showLinkTimer = setTimeout(() => {
        this.setState({
          showLink: true,
        });
      }, 1000);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    clearTimeout(this.showLinkTimer);
  }

  onClick = async () => {
    const { onClick } = this.props;

    if (!onClick) {
      return;
    }

    this.setState({
      showLink: false,
    });

    try {
      await onClick();
    } finally {
      this.setState({
        showLink: true,
      });
    }
  };

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
