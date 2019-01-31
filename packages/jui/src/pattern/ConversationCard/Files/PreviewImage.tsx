/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  Component,
  RefObject,
  createRef,
  CSSProperties,
  memo,
  ReactNode,
} from 'react';
import * as Jui from './style';
import { FileName } from './FileName';
import styled from '../../../foundation/styled-components';
import { grey } from '../../../foundation/utils';
import { JuiIconography } from '../../../foundation/Iconography';
import {
  getThumbnailSize,
  ThumbnailInfo,
  getThumbnailForSquareSize,
} from '../../../foundation/utils/calculateImageSize';

type SizeType = {
  width: number;
  height: number;
};

type JuiPreviewImageProps = {
  Actions?: JSX.Element;
  fileName: string;
  forceSize?: boolean;
  squareSize?: number;
  url: string;
} & SizeType;

const LoaderComponent = styled.div`
  display: flex;
  background: ${grey('100')};
  justify-content: center;
  align-items: center;
`;

const MyLoader = (props: any) => (
  <LoaderComponent {...props}>
    <JuiIconography fontSize="large" className="rc-image-loader">
      image_preview
    </JuiIconography>
  </LoaderComponent>
);

const JuiImageLoadingPlaceholder = memo((props: SizeType) => (
  <Jui.ImageCard width={props.width} height={props.height}>
    <MyLoader style={{ width: props.width, height: props.height }} />
  </Jui.ImageCard>
));

class JuiPreviewImage extends Component<JuiPreviewImageProps> {
  static SQUARE_SIZE = 180;
  private _placeholder: ReactNode;
  private _imageInfo: ThumbnailInfo = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    justifyHeight: false,
    justifyWidth: false,
  };
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _mounted: boolean = false;
  private _loaded: boolean = false;

  private _handleImageLoad = () => {
    const { forceSize, squareSize } = this.props;
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
    this._loaded = true;
    if (this._mounted) {
      this.forceUpdate();
    }
  }
  componentDidMount() {
    this._mounted = true;
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  private get placeholder() {
    if (!this._placeholder) {
      const { width, height } = this.props;
      this._placeholder = (
        <JuiImageLoadingPlaceholder width={width} height={height} />
      );
    }
    return this._placeholder;
  }
  render() {
    const { Actions, fileName, forceSize, url } = this.props;
    let { width, height } = this.props;
    const imageProps = {} as SizeType;
    const imageStyle: CSSProperties = { position: 'absolute', display: 'none' };
    if (this._loaded) {
      if (!forceSize) {
        height = this._imageInfo.height;
        width = this._imageInfo.width;
      }
      const { justifyHeight, justifyWidth, top, left } = this._imageInfo;
      imageStyle.top = top;
      imageStyle.left = left;
      imageStyle.display = 'block';
      if (justifyHeight) {
        imageProps.height = this._imageInfo.height;
      } else if (justifyWidth) {
        imageProps.width = this._imageInfo.width;
      }
    } else {
      width = 0;
      height = 0;
    }
    return (
      <>
        {!this._loaded && this.placeholder}
        <Jui.ImageCard width={width} height={height}>
          <img
            style={imageStyle}
            ref={this._imageRef}
            src={url}
            onLoad={this._handleImageLoad}
            {...imageProps}
          />
          <Jui.ImageFileInfo width={width} height={height} component="div">
            <FileName filename={fileName} />
            <Jui.FileActionsWrapper>{Actions}</Jui.FileActionsWrapper>
          </Jui.ImageFileInfo>
        </Jui.ImageCard>
      </>
    );
  }
}

export { JuiPreviewImage, JuiPreviewImageProps };
