/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import * as Jui from './style';
import { FileName } from './FileName';
import React, {
  PureComponent,
  RefObject,
  createRef,
  CSSProperties,
} from 'react';
import {
  getThumbnailSize,
  ThumbnailInfo,
  getThumbnailForSquareSize,
} from '../../../foundation/utils/calculateImageSize';
import { JuiIconography } from '../../../foundation/Iconography';
import styled from '../../../foundation/styled-components';
import { grey } from '../../../foundation/utils';
import { withDelay } from '../../../hoc/withDelay';

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
  placeholder?: JSX.Element;
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

const Icon = withDelay(() => (
  <JuiIconography fontSize="large">image_preview</JuiIconography>
));

const JuiDelayPlaceholder = (props: SizeType) => (
  <Jui.ImageCard width={props.width} height={props.height}>
    <Wrapper>
      <Icon delay={400} />
    </Wrapper>
  </Jui.ImageCard>
);

class JuiPreviewImage extends PureComponent<JuiPreviewImageProps> {
  static SQUARE_SIZE = 180;
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
  render() {
    const { Actions, fileName, forceSize, url, placeholder } = this.props;
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
    }
    return (
      <>
        {!this._loaded && placeholder}
        {!this._loaded && url && (
          <img
            style={{ display: 'none' }}
            ref={this._imageRef}
            src={url}
            onLoad={this._handleImageLoad}
          />
        )}
        {this._loaded && (
          <Jui.ImageCard width={width} height={height}>
            <img style={imageStyle} src={url} {...imageProps} />
            <Jui.ImageFileInfo width={width} height={height} component="div">
              <FileName filename={fileName} />
              <Jui.FileActionsWrapper>{Actions}</Jui.FileActionsWrapper>
            </Jui.ImageFileInfo>
          </Jui.ImageCard>
        )}
      </>
    );
  }
}

export { JuiPreviewImage, JuiPreviewImageProps, JuiDelayPlaceholder };
