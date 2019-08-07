/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import * as Jui from './style';
import { FileName } from './FileName';
import React, { PureComponent, RefObject, createRef } from 'react';
import {
  getThumbnailSize,
  ThumbnailInfo,
  getThumbnailForSquareSize,
} from '../../../foundation/utils/calculateImageSize';
import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { grey } from '../../../foundation/utils';
import { withDelay } from '../../../hoc/withDelay';
import { JuiButtonBar } from '../../../components/Buttons';

type SizeType = {
  width: number;
  height: number;
};

type JuiPreviewImageProps = {
  Actions?: JSX.Element[];
  fileName: React.ReactChild | (React.ReactChild | null)[] | null;
  forceSize?: boolean;
  squareSize?: number;
  url: string;
  placeholder?: JSX.Element;
  handleImageClick?: (ev: React.MouseEvent, loaded: boolean) => void;
  didLoad?: Function;
  futureCallback?: Function;
  fileID: number;
} & SizeType;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  & .image-preview:before {
    color: ${grey('400')} !important;
  }
`;

const StyledImg = styled.img`
  &:hover {
    cursor: pointer;
  }
`;

const Icon = withDelay(() => (
  <JuiIconography iconSize="extraLarge">image_preview</JuiIconography>
));

const JuiDelayPlaceholder = (props: SizeType) => (
  <Jui.ImageCard transparent {...props}>
    <Wrapper>
      <Icon delay={20} />
    </Wrapper>
  </Jui.ImageCard>
);

type State = {
  postloadURL: string; // s3 url
  url: string;
  originURL: string;
  loaded: boolean;
  retryCount: number;
  fileID: number;
};

const MAX_RETRY_COUNT = 100;

const kInvalidFileID = -1;

class JuiPreviewImage extends PureComponent<JuiPreviewImageProps, State> {
  static SQUARE_SIZE = 180;
  private _imageInfo: ThumbnailInfo = {
    width: 0,
    height: 0,
    imageWidth: 0,
    imageHeight: 0,
    left: 0,
    top: 0,
    justifyHeight: false,
    justifyWidth: false,
  };
  private _imageRef: RefObject<any> = createRef();
  private _mounted: boolean = false;
  state: State;

  constructor(props: JuiPreviewImageProps) {
    super(props);
    this.state = {
      postloadURL: '',
      url: props.url,
      originURL: props.url,
      loaded: false,
      retryCount: 0,
      fileID: kInvalidFileID,
    };
  }

  static getDerivedStateFromProps(
    nextProps: JuiPreviewImageProps,
    prevState: State,
  ) {
    const newURL = nextProps.url;
    const newFileID = nextProps.fileID;
    if (prevState.loaded) {
      // this will happen after uploaded image and created thumbnail on S3 server
      // thumbnail url will be updated, but we don't need to refresh UI, just
      // download the image by an invisible <img />
      if (newURL !== prevState.originURL) {
        return { postloadURL: newURL };
      }
    } else if (
      !prevState.loaded &&
      newFileID !== kInvalidFileID &&
      newFileID !== prevState.fileID &&
      newURL !== prevState.originURL
    ) {
      // since there are lots of middle state change during the image upload
      // we try to only change when needed
      return {
        url: newURL,
        originURL: newURL,
        loaded: false,
        retryCount: 0,
        fileID: newFileID,
      };
    }

    return null;
  }

  private _handleImageLoad = () => {
    const { forceSize, squareSize, didLoad } = this.props;
    const { width, height } = this._imageRef.current!;
    if (forceSize) {
      this._imageInfo = getThumbnailForSquareSize(
        width,
        height,
        squareSize || JuiPreviewImage.SQUARE_SIZE,
      );
    } else {
      this._imageInfo = getThumbnailSize(width, height);
    }
    didLoad && didLoad(this.props.futureCallback);
    if (this._mounted) {
      this.setState({ loaded: true });
    }
  };

  private _tryToReloadImage = () => {
    const { loaded, originURL, retryCount } = this.state;
    if (!loaded && retryCount < MAX_RETRY_COUNT) {
      // force to use new URL to trigger image-reload
      const newURL = `${originURL}&timestamp=${Date.now()}`;
      this.setState({ url: newURL });
    }
  };

  private _handleImageLoadError = () => {
    const { retryCount } = this.state;
    this.setState(
      { loaded: false, retryCount: retryCount + 1 },
      this._tryToReloadImage,
    );
  };

  private _getImageStyle = (squareWidth: number, squareHeight: number) => {
    if (!this.state.loaded) return { display: 'none' };

    const { justifyHeight, justifyWidth } = this._imageInfo;

    const styleWidth = justifyWidth ? { width: squareWidth } : {};
    const styleHeight = justifyHeight ? { height: squareHeight } : {};

    return { ...styleWidth, ...styleHeight, display: 'block' };
  };

  private _handleImageClick = (ev: React.MouseEvent) => {
    this.props.handleImageClick &&
      this.props.handleImageClick(ev, this.state.loaded);
  };

  componentDidMount() {
    this._mounted = true;
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  render() {
    const { Actions, fileName, forceSize, placeholder } = this.props;
    const { loaded, url, postloadURL } = this.state;
    const { width, height } =
      loaded && !forceSize ? this._imageInfo : this.props;
    const imageStyle = this._getImageStyle(width, height);
    return (
      <React.Fragment>
        {!loaded && placeholder}
        {postloadURL && (
          <img alt="" src={postloadURL} style={{ display: 'none' }} />
        )}
        {!loaded && url && (
          <StyledImg
            style={{ display: 'none' }}
            ref={this._imageRef}
            src={url}
            onLoad={this._handleImageLoad}
            onError={this._handleImageLoadError}
          />
        )}
        {loaded && (
          <Jui.ImageCard
            width={width}
            data-test-automation-id="imageCard"
            height={height}
            onClick={this._handleImageClick}
          >
            <StyledImg
              data-test-automation-class="image"
              style={imageStyle}
              src={url}
            />
            <Jui.ImageFileInfo width={width} height={height} component="div">
              <FileName>{fileName}</FileName>
              {Actions && (
                <Jui.FileActionsWrapper>
                  <JuiButtonBar isStopPropagation overlapSize={-2}>
                    {Actions}
                  </JuiButtonBar>
                </Jui.FileActionsWrapper>
              )}
            </Jui.ImageFileInfo>
          </Jui.ImageCard>
        )}
      </React.Fragment>
    );
  }
}

export {
  JuiPreviewImage,
  JuiPreviewImageProps,
  JuiDelayPlaceholder,
  StyledImg,
};
