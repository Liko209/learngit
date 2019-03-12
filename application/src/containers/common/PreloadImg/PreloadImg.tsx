/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 13:35:29
 * Copyright © RingCentral. All rights reserved.
 */
<<<<<<< HEAD
import React, { Component, Fragment } from 'react';
import { JuiFade } from 'jui/components/Animation';
import { withDelay } from 'jui/hoc/withDelay';
=======
import React, { Component } from 'react';
>>>>>>> hotfix/1.1.1.190305

type PreloadImgProps = {
  url?: string;
  placeholder: React.ReactNode;
  children: React.ReactNode;
  animationForLoad?: boolean;
  delayForPlaceholder?: boolean;
};

type PreloadImgState = {
  loaded: boolean;
  isError: boolean;
};

class PreloadImg extends Component<PreloadImgProps, PreloadImgState> {
  constructor(props: PreloadImgProps) {
    super(props);
    this.state = {
      loaded: false,
      isError: false,
    };
  }

  handleLoad = () => {
    return this.setState({ loaded: true });
  }

  handleError = () => {
    const { url } = this.props;
    if (url) {
      this.setState({ isError: true, loaded: true });
    }
  }

  render() {
    const { children, placeholder, url } = this.props;
    const { loaded, isError } = this.state;

<<<<<<< HEAD
    if (loaded && !isError) {
      return animationForLoad ? (
        <JuiFade appear={true} show={true} duration="standard" easing="easeIn">
          {children}
        </JuiFade>
      ) : (
        children
      );
    }

    if (url && cacheUrl[url]) {
      return children;
    }

    if (isError) {
      return placeholder;
    }

=======
>>>>>>> hotfix/1.1.1.190305
    return (
      <>
        {url && !loaded && (
          <img
            src={url}
            onLoad={this.handleLoad}
            onError={this.handleError}
            style={{ display: 'none' }}
          />
        )}
        {isError ? placeholder : children}
      </>
    );
  }
}

export { PreloadImg };
