/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef } from 'react';
import * as Jui from './style';
import { FileName } from './FileName';
import { getThumbnailSize } from '../../../foundation/utils/calculateImageSize';

type SizeType = {
  width: number;
  height: number;
};

type JuiPreviewImageProps = {
  Actions?: JSX.Element;
  fileName: string;
  forceSize?: boolean;
  url: string;
} & SizeType;

class JuiPreviewImage extends Component<JuiPreviewImageProps> {
  private _imageSize: SizeType = {
    width: 0,
    height: 0,
  };
  private _imageRef: RefObject<HTMLImageElement> = createRef();
  private _handleImageLoad = () => {
    const { current } = this._imageRef;
    if (current) {
      this._imageSize = getThumbnailSize(current.width, current.height);
      this.forceUpdate();
    }
  }
  render() {
    const { Actions, fileName, url, forceSize } = this.props;
    let { width, height } = this.props;
    const imageProps = {} as SizeType;
    if (this._imageSize.width !== 0 && this._imageSize.height !== 0) {
      if (!forceSize) {
        width = this._imageSize.width;
        height = this._imageSize.height;
      }
      imageProps.width = width;
      imageProps.height = height;
    }
    return (
      <Jui.ImageCard width={width} height={height}>
        <img
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
    );
  }
}

export { JuiPreviewImage, JuiPreviewImageProps };
