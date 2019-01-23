/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef, CSSProperties } from 'react';
import * as Jui from './style';
import { FileName } from './FileName';
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

class JuiPreviewImage extends Component<JuiPreviewImageProps> {
  static SQUARE_SIZE = 180;
  private _mounted: boolean;
  private _imageInfo: ThumbnailInfo = {
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    justifyHeight: false,
    justifyWidth: false,
  };
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _image: HTMLImageElement;
  private _loaded: boolean = false;
  constructor(props: JuiPreviewImageProps) {
    super(props);
    this._image = new Image();
    this._image.src = props.url;
    this._image.onload = this._handleImageLoad;
  }
  private _handleImageLoad = () => {
    this._loaded = true;
    const { forceSize, squareSize } = this.props;
    const { width, height } = this._image;
    if (forceSize) {
      this._imageInfo = getThumbnailForSquareSize(
        width,
        height,
        squareSize || JuiPreviewImage.SQUARE_SIZE,
      );
    } else {
      this._imageInfo = getThumbnailSize(width, height);
    }
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
  render() {
    const { Actions, fileName, forceSize } = this.props;
    let { width, height } = this.props;
    const imageProps = {} as SizeType;
    const imageStyle: CSSProperties = { position: 'absolute' };
    if (this._imageInfo.width !== 0 && this._imageInfo.height !== 0) {
      if (!forceSize) {
        height = this._imageInfo.height;
        width = this._imageInfo.width;
      }
      const { justifyHeight, justifyWidth, top, left } = this._imageInfo;
      imageStyle.top = top;
      imageStyle.left = left;
      if (justifyHeight) {
        imageProps.height = this._imageInfo.height;
      } else if (justifyWidth) {
        imageProps.width = this._imageInfo.width;
      }
    }
    return (
      <Jui.ImageCard width={width} height={height}>
        {this._loaded && (
          <img
            style={imageStyle}
            ref={this._imageRef}
            src={this._image.src}
            {...imageProps}
          />
        )}
        <Jui.ImageFileInfo width={width} height={height} component="div">
          <FileName filename={fileName} />
          <Jui.FileActionsWrapper>{Actions}</Jui.FileActionsWrapper>
        </Jui.ImageFileInfo>
      </Jui.ImageCard>
    );
  }
}

export { JuiPreviewImage, JuiPreviewImageProps };
