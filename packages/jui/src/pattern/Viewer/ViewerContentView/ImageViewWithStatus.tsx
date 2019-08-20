/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-08-20 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  ComponentType,
  createRef,
  RefObject,
  SyntheticEvent,
} from 'react';

import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import _ from 'lodash';

const StyledLoadingPage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledImage = styled.img<{ visibility: string }>`
  display: block;
  box-shadow: ${({ theme }) => theme.shadows[7]};
  visibility: ${({ visibility }) => visibility};
  user-select: none;
`;

const HiddenImage = styled.img`
  visibility: hidden;
  display: none;
`;

type JuiImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  imageRef?: RefObject<HTMLImageElement>;
  loadingPlaceHolder?: ComponentType<any>;
  thumbnailSrc?: string;
  onSizeLoad?: (naturalWidth: number, naturalHeight: number) => void;
  onLoad?: () => void;
  onError?: () => void;
  performanceTracerStart?: () => void;
  performanceTracerEnd?: () => void;
};

type JuiImageState = {
  currentShow: 'raw' | 'thumbnail';
  loadings: {
    raw: boolean;
    thumbnail?: boolean;
  };
  errors: {
    raw: boolean;
    thumbnail?: boolean;
  };
};

function isThumbnailMode(props: JuiImageProps) {
  return props.thumbnailSrc && props.thumbnailSrc !== props.src;
}

class JuiImageView extends React.Component<JuiImageProps, JuiImageState> {
  static initState: JuiImageState = {
    loadings: {
      raw: true,
    },
    errors: {
      raw: false,
    },
    currentShow: 'raw',
  };
  static initThumbnailModeState: JuiImageState = {
    loadings: {
      raw: true,
      thumbnail: true,
    },
    errors: {
      raw: false,
      thumbnail: false,
    },
    currentShow: 'thumbnail',
  };

  private _imageRef: RefObject<HTMLImageElement> = createRef();

  constructor(props: JuiImageProps) {
    super(props);
    const { performanceTracerStart } = this.props;
    performanceTracerStart && performanceTracerStart();
    this.state = this.getInitState(props);
    const { width, height, onSizeLoad } = this.props;
    width && height && onSizeLoad && onSizeLoad(Number(width), Number(height));
  }
  getInitState(props: JuiImageProps): JuiImageState {
    if (isThumbnailMode(props)) {
      return _.cloneDeep(JuiImageView.initThumbnailModeState);
    }
    return _.cloneDeep(JuiImageView.initState);
  }
  getImageRef = (): RefObject<HTMLImageElement> =>
    this.props.imageRef || this._imageRef;

  private _errorView() {
    return (
      <StyledLoadingPage>
        <JuiIconography iconSize="extraLarge" iconColor={['grey', '400']}>
          image_broken
        </JuiIconography>
      </StyledLoadingPage>
    );
  }

  render() {
    const { loadings, errors, currentShow } = this.state;
    const {
      onSizeLoad,
      onLoad,
      onError,
      loadingPlaceHolder,
      imageRef: viewRef,
      thumbnailSrc,
      src,
      ...rest
    } = this.props;
    const currentShowSrc = currentShow === 'raw' ? src : thumbnailSrc;
    const error = _.values(errors).every((status: boolean) => status);
    return (
      <>
        <StyledImage
          ref={this.getImageRef() as any}
          src={currentShowSrc}
          visibility={error ? 'hidden' : 'visible'}
          onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
            if (currentShow === 'raw') {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              onSizeLoad && onSizeLoad(naturalWidth, naturalHeight);
              onLoad && onLoad();
              const { performanceTracerEnd } = this.props;
              performanceTracerEnd && performanceTracerEnd();
            }
            this.setState({
              loadings: {
                ...loadings,
                [currentShow]: false,
              },
            });
          }}
          onError={() => {
            if (currentShow === 'raw') {
              onError && onError();
            }
            this.setState({
              loadings: {
                ...loadings,
                [currentShow]: false,
              },
              errors: {
                ...errors,
                [currentShow]: true,
              },
            });
            onError && onError();
          }}
          {...rest}
        />
        {/* raw image loader */}
        {currentShow !== 'raw' && (
          <HiddenImage
            src={src}
            onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
              if (src === thumbnailSrc) {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                onSizeLoad && onSizeLoad(naturalWidth, naturalHeight);
              }
              this.setState({
                loadings: {
                  ...loadings,
                  raw: false,
                },
                currentShow: 'raw',
              });
            }}
            onError={() => {
              this.setState({
                loadings: {
                  ...loadings,
                  raw: false,
                },
                errors: {
                  ...errors,
                  raw: true,
                },
              });
            }}
          />
        )}
        {error && this._errorView()}
      </>
    );
  }
}
export { JuiImageView };
