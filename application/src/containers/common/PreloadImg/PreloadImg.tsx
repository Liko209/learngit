/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 13:35:29
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { JuiFade } from 'jui/foundation/Transitions';

type PreloadImgProps = {
  url?: string;
  placeholder: React.ReactNode;
  children: React.ReactNode;
};

type PreloadImgState = {
  loaded: boolean;
  isError: boolean;
  showPlaceholder: boolean;
};

const cacheUrl = {};
const DELAY_SHOW_PLACEHOLDER_TIME = 500;

class PreloadImg extends Component<PreloadImgProps, PreloadImgState> {
  private _delayTimer: NodeJS.Timeout;
  constructor(props: PreloadImgProps) {
    super(props);
    this.state = {
      loaded: false,
      isError: false,
      showPlaceholder: false,
    };
  }

  clearDelayTimer = () => {
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
    }
  }

  componentWillMount() {
    this._delayTimer = setTimeout(() => {
      this.setState({ showPlaceholder: true });
    },                            DELAY_SHOW_PLACEHOLDER_TIME);
  }

  componentWillUnMount() {
    this.clearDelayTimer();
  }

  handleLoad = () => {
    const { url } = this.props;
    this.setState({ loaded: true, showPlaceholder: true });
    if (url) cacheUrl[url] = true;
    this.clearDelayTimer();
  }

  handleError = () => {
    const { url } = this.props;
    if (url) {
      this.setState({ isError: true, loaded: true, showPlaceholder: true });
      this.clearDelayTimer();
    }
  }

  render() {
    const { children, placeholder, url } = this.props;
    const { loaded, isError, showPlaceholder } = this.state;

    if (loaded && !isError) {
      return (
        <JuiFade in={true} timeout={1500}>
          {children}
        </JuiFade>
      );
    }

    if (url && cacheUrl[url]) {
      return children;
    }

    return (
      <>
        <img
          src={url}
          onLoad={this.handleLoad}
          onError={this.handleError}
          style={{ display: 'none' }}
        />
        {showPlaceholder && placeholder}
      </>
    );
  }
}

export { PreloadImg };
