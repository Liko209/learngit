/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 16:33:52
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, createRef, RefObject } from 'react';

import { JuiCircularProgress } from '../../components/Progress';
import styled from '../../foundation/styled-components';
import { JuiIconography } from '../../foundation/Iconography';

const StyledLoadingPage = styled.div`
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
  viewRef?: RefObject<HTMLImageElement>;
  loadingPlaceHolder?: ComponentType<any>;
  onSizeLoad?: (naturalWidth: number, naturalHeight: number) => void;
};

type JuiImageState = {
  loading: boolean;
  error: boolean;
  naturalWidth: number;
  naturalHeight: number;
};

class JuiImageView extends React.Component<JuiImageProps, JuiImageState> {
  private _imageRef: RefObject<HTMLImageElement> = createRef();

  constructor(props: JuiImageProps) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      naturalWidth: 0,
      naturalHeight: 0,
    };
  }

  getImageRef = (): RefObject<HTMLImageElement> => {
    return this.props.viewRef || this._imageRef;
  }

  componentWillReceiveProps(newProps: JuiImageProps) {
    if (newProps.src !== this.props.src) {
      this.setState({
        loading: true,
        error: false,
        naturalHeight: 0,
        naturalWidth: 0,
      });
    }
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
        <JuiIconography iconColor={['grey', '400']}>
          image_broken
        </JuiIconography>
      </StyledLoadingPage>
    );
  }

  render() {
    const { loading, error } = this.state;
    const { onSizeLoad, loadingPlaceHolder, viewRef, ...rest } = this.props;
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
