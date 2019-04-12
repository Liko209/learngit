/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-05 15:46:47
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiRightRailLoading } from './RightRailLoading';
import { JuiStreamLoading } from './StreamLoading';

const LoadingWrapper = styled.div`
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
`;

type JuiConversationLoadingProps = {
  tip: string;
  linkText: string;
  showTip?: boolean;
  onClick: () => void;
};

type State = {
  showLoading: boolean;
};

const DELAY_LOADING = 300;

class JuiConversationLoading extends React.PureComponent<
  JuiConversationLoadingProps,
  State
> {
  timer: NodeJS.Timeout;

  readonly state = {
    showLoading: false,
  };

  componentDidMount() {
    this.timer = setTimeout(() => {
      this.setState({
        showLoading: true,
      });
    },                      DELAY_LOADING);
  }

  render() {
    const { showLoading } = this.state;

    return (
      showLoading && (
        <LoadingWrapper>
          <JuiStreamLoading {...this.props} />
          <JuiRightRailLoading />
        </LoadingWrapper>
      )
    );
  }
}

export { JuiConversationLoading, LoadingWrapper };
