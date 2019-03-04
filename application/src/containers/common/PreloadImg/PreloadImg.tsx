/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 13:35:29
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, Fragment } from 'react';
import { JuiFade } from 'jui/components/Animation';
import { withDelay } from 'jui/hoc/withDelay';

type PreloadImgProps = {
  url?: string;
  placeholder: React.ReactNode;
  children: React.ReactNode;
  animationForLoad?: boolean;
};

type PreloadImgState = {
  loaded: boolean;
  isError: boolean;
};

const cacheUrl = {};
const DELAY_SHOW_PLACEHOLDER_TIME = 500;

const DelayWrapper = withDelay(Fragment);

class PreloadImg extends Component<PreloadImgProps, PreloadImgState> {
  constructor(props: PreloadImgProps) {
    super(props);
    this.state = {
      loaded: false,
      isError: false,
    };
  }

  handleLoad = () => {
    const { url } = this.props;
    if (url) cacheUrl[url] = true;
    this.setState({ loaded: true });
  }

  handleError = () => {
    const { url } = this.props;
    if (url) {
      this.setState({ isError: true, loaded: true });
    }
  }

  render() {
    const { children, placeholder, url, animationForLoad } = this.props;
    const { loaded, isError } = this.state;

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
        {!loaded && (
          <DelayWrapper
            delay={DELAY_SHOW_PLACEHOLDER_TIME}
            placeholder={<div style={{ opacity: 0 }}>{children}</div>}
          >
            {placeholder}
          </DelayWrapper>
        )}
      </>
    );
  }
}

export { PreloadImg };
