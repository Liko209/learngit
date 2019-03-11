/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 16:33:52
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, createRef, RefObject } from 'react';

import { JuiCircularProgress } from '../../components/Progress';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';

const StyledLoadingPage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${({ theme }) => theme.zIndex && theme.zIndex.loading};
`;

type JuiImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  imageRef?: RefObject<HTMLImageElement>;
  loadingPlaceHolder?: ComponentType<any>;
  onSizeLoad?: (naturalWidth: number, naturalHeight: number) => void;
};

type JuiImageState = {
  src?: string;
  loading: boolean;
  error: boolean;
  naturalWidth: number;
  naturalHeight: number;
};

class JuiImageView extends React.Component<JuiImageProps, JuiImageState> {
  static initState: JuiImageState = {
    loading: true,
    error: false,
    naturalWidth: 0,
    naturalHeight: 0,
  };

  private _imageRef: RefObject<HTMLImageElement> = createRef();

  constructor(props: JuiImageProps) {
    super(props);
    this.state = {
      ...JuiImageView.initState,
      src: props.src,
    };
  }

  static getDerivedStateFromProps(
    nextProps: JuiImageProps,
    prevState: JuiImageState,
  ) {
    if (nextProps.src !== prevState.src) {
      return {
        ...JuiImageView.initState,
        src: nextProps.src,
      };
    }
    return null;
  }

  getImageRef = (): RefObject<HTMLImageElement> => {
    return this.props.imageRef || this._imageRef;
  }

  private _loadingView() {
    return (
      <StyledLoadingPage>
        <JuiCircularProgress />
      </StyledLoadingPage>
    );
  }

  private _errorView() {
    return (
      <StyledLoadingPage>
        <JuiIconography iconSize="large" iconColor={['grey', '400']}>
          image_broken
        </JuiIconography>
      </StyledLoadingPage>
    );
  }

  render() {
    const { loading, error } = this.state;
    const {
      onSizeLoad,
      loadingPlaceHolder,
      imageRef: viewRef,
      ...rest
    } = this.props;
    return (
      <>
        {loading && this._loadingView()}
        <img
          ref={this.getImageRef()}
          style={{ visibility: loading || error ? 'hidden' : 'visible' }}
          onLoad={() => {
            const { naturalWidth, naturalHeight } = this.getImageRef().current!;
            onSizeLoad && onSizeLoad(naturalWidth, naturalHeight);
            this.setState({
              naturalWidth,
              naturalHeight,
              loading: false,
            });
          }}
          onError={() => {
            this.setState({
              loading: false,
              error: true,
            });
          }}
          {...rest}
        />
        {error && this._errorView()}
      </>
    );
  }
}

export { JuiImageView };
