/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-04-02 10:29:39
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { SettingContainerViewProps } from './types';
import { observer } from 'mobx-react';
import styled from 'jui/foundation/styled-components';

const StyledSettingContainer = styled.div`
  overflow: auto;
  height: 100%;
`;

@observer
class SettingContainerViewComponent extends Component<
  SettingContainerViewProps
> {
  private _wrapRef: React.RefObject<any> = React.createRef();

  private _scrollEl: HTMLElement;

  componentDidMount() {
    this.scrollToPosition();
  }

  componentWillUnmount() {
    this.setScrollHeight();
  }

  scrollToPosition = () => {
    const { type, getCurrentTypeScrollHeight } = this.props;
    const scrollHeight = getCurrentTypeScrollHeight(type);
    const scrollEl = this._wrapRef.current;
    if (scrollEl) {
      this._scrollEl = scrollEl;
      this._scrollEl.scrollTop = scrollHeight;
    }
  }

  setScrollHeight = () => {
    if (this._scrollEl) {
      const { type, setCurrentTypeScrollHeight } = this.props;
      setCurrentTypeScrollHeight(type, this._scrollEl.scrollTop);
    }
  }

  render() {
    return (
      <StyledSettingContainer ref={this._wrapRef}>
        {this.props.children}
      </StyledSettingContainer>
    );
  }
}

export { SettingContainerViewComponent as SettingContainerView };
