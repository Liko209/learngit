import React, { ComponentType, RefObject, createRef } from 'react';
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

type ImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  loadingPlaceHolder?: ComponentType<any>;
  onSizeLoad?: (naturalWidth: number, naturalHeight: number) => void;
};

type ImageState = {
  loading: boolean;
  error: boolean;
  naturalWidth: number;
  naturalHeight: number;
};

class ImageView extends React.Component<ImageProps, ImageState> {
  private _imageRef: RefObject<any> = createRef();

  constructor(props: ImageProps) {
    super(props);
    this.state = {
      loading: true,
      error: false,
      naturalWidth: 0,
      naturalHeight: 0,
    };
  }

  componentWillReceiveProps(newProps: ImageProps) {
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
    return (
      <>
        {loading ? (
          <StyledLoadingPage>
            <JuiCircularProgress />
          </StyledLoadingPage>
        ) : null}
        <img
          ref={this._imageRef}
          style={{ visibility: loading || error ? 'hidden' : 'visible' }}
          onLoad={() => {
            const { naturalWidth, naturalHeight } = this._imageRef.current!;
            this.props.onSizeLoad &&
              this.props.onSizeLoad(naturalWidth, naturalHeight);
            this.setState({
              loading: false,
              naturalWidth: naturalHeight as number,
              naturalHeight: naturalHeight as number,
            });
          }}
          onError={() => {
            this.setState({
              loading: false,
              error: true,
            });
          }}
          {...this.props}
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

export { ImageView };
