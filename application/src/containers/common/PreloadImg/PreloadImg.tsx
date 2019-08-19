/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-24 13:35:29
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils/entities';
import { reaction, IReactionDisposer } from 'mobx';

import { mainLogger } from 'foundation/log';

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

@observer
class PreloadImg extends Component<PreloadImgProps, PreloadImgState> {
  private _disposeReaction: IReactionDisposer;

  constructor(props: PreloadImgProps) {
    super(props);
    this.state = {
      loaded: false,
      isError: false,
    };
    this._disposeReaction = reaction(
      () => getGlobalValue(GLOBAL_KEYS.NETWORK),
      (status: string) => {
        if (status === 'online' && this.state.isError) {
          this.setState({
            isError: false,
            loaded: false,
          });
        }
      },
    );
  }

  componentWillUnmount() {
    this._disposeReaction();
  }

  handleLoad = () => {
    return this.setState({ loaded: true });
  };

  handleError = () => {
    const { url } = this.props;
    if (url) {
      mainLogger.warn('Preload image', 'Network error');
      this.setState({ isError: true, loaded: true });
    }
  };

  render() {
    const { children, placeholder, url } = this.props;
    const { loaded, isError } = this.state;

    return (
      <>
        {url && !loaded && (
          <img
            src={url}
            alt=""
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
