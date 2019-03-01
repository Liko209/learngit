/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 16:33:52
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ComponentType, createRef, RefObject } from 'react';

import { JuiCircularProgress } from '../../components/Progress';
import styled from '../../foundation/styled-components';

const StyledLoadingPage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0px;
  left: 0px;
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

  render() {
    const { loading, error } = this.state;
    const { onSizeLoad, loadingPlaceHolder, viewRef, ...rest } = this.props;
    return (
      <>
        {loading ? (
          <StyledLoadingPage>
            <JuiCircularProgress />
          </StyledLoadingPage>
        ) : null}
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
        {error ? (
          <StyledLoadingPage>
            <span>error</span>
          </StyledLoadingPage>
        ) : null}
      </>
    );
  }
}

export { JuiImageView };
