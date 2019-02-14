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
  state = { loaded: false, isError: false };
  img: any;

  handleLoad = () => {
    const { url } = this.props;

    this.setState({ loaded: true });
    if (url) cacheUrl[url] = true;
  }

  handleError = () => {
    this.setState({ isError: true, loaded: true });
  }

  render() {
    const { children, placeholder, url } = this.props;
    const { loaded, isError } = this.state;

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
        {placeholder}
      </>
    );
  }
}

export { PreloadImg };
