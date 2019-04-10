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
  handleImageClick?: (ev: React.MouseEvent, loaded: boolean) => void;
  didLoad?: Function;
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
  <Jui.ImageCard {...props}>
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
    imageWidth: 0,
    imageHeight: 0,
    left: 0,
    top: 0,
    justifyHeight: false,
    justifyWidth: false,
  };
  private _imageRef: RefObject<any> = createRef();
  private _mounted: boolean = false;
  private _loaded: boolean = false;
  private _updating: boolean = false;

  componentDidUpdate(prevProps: JuiPreviewImageProps) {
    if (prevProps.url !== this.props.url) {
      this._updating = true;
      this.forceUpdate();
    }
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
    this._loaded = true;
    this._updating = false;
    didLoad && didLoad();
    if (this._mounted) {
      this.forceUpdate();
    }
  }

  private _getImageStyle = (squareWidth: number, squareHeight: number) => {
    if (!this._loaded) return { display: 'none' };

    const { justifyHeight, justifyWidth } = this._imageInfo;

    const styleWidth = justifyWidth ? { width: squareWidth } : {};
    const styleHeight = justifyHeight ? { height: squareHeight } : {};

    return { ...styleWidth, ...styleHeight, display: 'block' };
  }

  private _handleImageClick = (ev: React.MouseEvent) => {
    this.props.handleImageClick &&
      this.props.handleImageClick(ev, this._loaded);
  }

  componentDidMount() {
    this._mounted = true;
  }
  componentWillUnmount() {
    this._mounted = false;
  }
  render() {
    const { Actions, fileName, forceSize, url, placeholder } = this.props;

    const { width, height } =
      this._loaded && !forceSize ? this._imageInfo : this.props;

    const imageStyle = this._getImageStyle(width, height);

    return (
      <>
        {!this._loaded && placeholder}
        {(!this._loaded || this._updating) && url && (
          <StyledImg
            style={{ display: 'none' }}
            ref={this._imageRef}
            src={url}
            onLoad={this._handleImageLoad}
            onClick={this._handleImageClick}
          />
        )}
        {this._loaded && (
          <Jui.ImageCard width={width} height={height}>
            <StyledImg
              style={imageStyle}
              src={url}
              onClick={this._handleImageClick}
            />
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

export {
  JuiPreviewImage,
  JuiPreviewImageProps,
  JuiDelayPlaceholder,
  StyledImg,
};
