/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 16:33:52
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  ComponentType,
  createRef,
  RefObject,
  SyntheticEvent,
} from 'react';

import { RuiCircularProgress } from 'rcui/components/Progress';
import { JuiIconography } from '../../foundation/Iconography';
import styled from '../../foundation/styled-components';
import { withDelay } from '../../hoc/withDelay';
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

const DelayLoadingPage = withDelay(StyledLoadingPage);

type JuiImageProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLImageElement>,
  HTMLImageElement
> & {
  imageRef?: RefObject<HTMLImageElement>;
  loadingPlaceHolder?: ComponentType<any>;
  thumbnailSrc?: string;
  onSizeLoad?: (naturalWidth: number, naturalHeight: number) => void;
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

const DELAY_SHOW_LOADING_TIME = 500;

function isThumbnailMode(props: JuiImageProps) {
  return props.thumbnailSrc && props.thumbnailSrc !== props.src;
}

function getInitState(props: JuiImageProps): JuiImageState {
  if (isThumbnailMode(props)) {
    return _.cloneDeep(JuiImageView.initThumbnailModeState);
  }
  return _.cloneDeep(JuiImageView.initState);
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
    this.state = getInitState(props);
    const { width, height, onSizeLoad } = this.props;
    width && height && onSizeLoad && onSizeLoad(Number(width), Number(height));
  }

  getImageRef = (): RefObject<HTMLImageElement> => {
    return this.props.imageRef || this._imageRef;
  }

  private _loadingView() {
    return (
      <DelayLoadingPage delay={DELAY_SHOW_LOADING_TIME}>
        <RuiCircularProgress />
      </DelayLoadingPage>
    );
  }

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
      loadingPlaceHolder,
      imageRef: viewRef,
      thumbnailSrc,
      src,
      ...rest
    } = this.props;
    const currentShowSrc = currentShow === 'raw' ? src : thumbnailSrc;
    const loading = _.values(loadings).every((status: boolean) => status);
    const error = _.values(errors).every((status: boolean) => status);
    return (
      <>
        {loading && this._loadingView()}
        <StyledImage
          ref={this.getImageRef() as any}
          src={currentShowSrc}
          visibility={loading || error ? 'hidden' : 'visible'}
          onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
            if (currentShow === 'raw') {
              const { naturalWidth, naturalHeight } = event.currentTarget;
              onSizeLoad && onSizeLoad(naturalWidth, naturalHeight);
            }
            this.setState({
              loadings: {
                ...loadings,
                [currentShow]: false,
              },
            });
          }}
          onError={() => {
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
          }}
          {...rest}
        />
        {/* raw image loader */}
        {currentShow !== 'raw' && (
          <HiddenImage
            src={src}
            onLoad={(event: SyntheticEvent<HTMLImageElement>) => {
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
