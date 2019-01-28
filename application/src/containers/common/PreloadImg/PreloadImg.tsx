/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 13:35:29
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';

type PreloadImgProps = {
  url?: string;
  placeholder: React.ReactNode;
  children: React.ReactNode;
};

class PreloadImg extends Component<PreloadImgProps> {
  state = { loaded: false, isError: false };
  img: any;

  handleLoad = () => {
    this.setState({ loaded: true });
  }

  handleError = () => {
    this.setState({ isError: true, loaded: true });
  }

  render() {
    const { children, placeholder, url } = this.props;
    return (
      <>
        {!this.state.loaded && url && (
          <img src={url} onLoad={this.handleLoad} onError={this.handleError} />
        )}
        {this.state.loaded && !this.state.isError ? children : placeholder}
      </>
    );
  }
}

export { PreloadImg };
