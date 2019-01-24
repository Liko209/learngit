/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-05 15:46:47
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
import { JuiRightRailLoading } from './RightRailLoding';

const LoadingWrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
`;

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
  color: ${grey('900')};
`;
const TipLink = styled(JuiLink)`
  ${typography('body2')};
`;

type JuiConversationLoadingProps = {
  tip: string;
  linkText: string;
  showTip?: boolean;
  onClick: () => void;
};

type State = {
  showLoading: boolean;
  showLink: boolean;
};

const DELAY_LOADING = 300;

class JuiConversationLoading extends React.Component<
  JuiConversationLoadingProps,
  State
> {
  timer: NodeJS.Timeout;
  showLinkTimer: NodeJS.Timeout;

  readonly state = {
    showLoading: false,
    showLink: true,
  };

  constructor(props: JuiConversationLoadingProps) {
    super(props);
  }

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({
        showLoading: true,
      });
    },                      DELAY_LOADING);
  }

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
    const { showLoading, showLink } = this.state;
    const { tip, linkText, showTip = false } = this.props;

    return (
      showLoading && (
        <LoadingWrapper>
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
          <JuiRightRailLoading />
        </LoadingWrapper>
      )
    );
  }
}

export {
  JuiConversationLoading,
  LoadingWrapper,
  Loading,
  Progress,
  Tip,
  TipLink,
};
