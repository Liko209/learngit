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

const cacheUrl = {};

class PreloadImg extends Component<PreloadImgProps> {
  state = { loaded: false, isError: false, flag: false };
  img: any;
  private _delayTimer: NodeJS.Timeout;
  constructor(props: PreloadImgProps) {
    super(props);
    this._delayTimer = setTimeout(() => {
      this.setState({ flag: true });
    },                            500);
  }

  handleLoad = () => {
    const { url } = this.props;

    this.setState({ loaded: true, flag: true });
    if (url) cacheUrl[url] = true;
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
    }
  }

  handleError = () => {
    this.setState({ isError: true, loaded: true, flag: true });
    if (this._delayTimer) {
      clearTimeout(this._delayTimer);
    }
  }

  render() {
    const { children, placeholder, url } = this.props;
    const { loaded, isError, flag } = this.state;

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
        {flag && placeholder}
      </>
    );
  }
}

export { PreloadImg };
