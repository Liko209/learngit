import React, { Component, createRef, ReactElement, RefObject } from 'react';
import ReactResizeDetector from 'react-resize-detector';

import styled from '../../foundation/styled-components';
import {
  ElementRect,
  Point,
  Transform,
  zoom,
} from '../../foundation/utils/calculateZoom';
import { DragArea, withDrag, WithDragProps } from '../../hoc/withDrag';
import { WithZoomProps, ZoomComponent, ZoomProps } from '../../hoc/withZoom';
import { ImageView } from './ImageView';

const TransformImageView = styled(ImageView)<{
  transition: boolean;
  transform: Transform;
  width: number;
  height: number;
}>`
  ${({ transform }) => {
    return `transform: scale(${transform.scale}) translate(${
      transform.translateX
    }px, ${transform.translateY}px);`;
  }}
  ${({ transition }) => {
    return transition ? 'transition: all 0.3s;' : null;
  }}
  ${({ width, height }) => {
    return width > 0 && height > 0
      ? `width:${width}px;height:${height}px;`
      : null;
  }}
  &:hover {
    cursor: move;
  }
`;
// const TransformImageView2 = withZoom(
//   withDrag(styled(ImageView)<
//     {
//       transition: boolean;
//       transform: Transform;
//       width: number;
//       height: number;
//     } & Partial<WithDragProps & WithZoomProps>
//   >`
//   ${({ transform, ...rest }) => {
//     console.log('==-=-=-=-', rest);
//     return `transform: scale(${transform.scale}) translate(${
//       transform.translateX
//     }px, ${transform.translateY}px);`;
//   }}
//   ${({ isDragging }) => {
//     // props.
//     return !isDragging ? 'transition: all 0.3s;' : null;
//   }}
//   ${({ width, height }) => {
//     return width > 0 && height > 0
//       ? `width:${width}px;height:${height}px;`
//       : null;
//   }}
//   &:hover {
//     cursor: move;
//   }
// `),
// );

type JuiZoomProps = {
  ratio: number;
  src: string;
  containerWidth?: number;
  containerHeight?: number;
};

type JuiZoomState = {
  isDragging: boolean;
  naturalWidth: number;
  naturalHeight: number;
  containerRect?: ElementRect;
  contentRect?: ElementRect;
  transform: Transform;
};

// const Container = styled.div<Partial<JuiZoomProps>>`
//   position: relative;
//   width: ${({ containerWidth = 600 }) => {
//     return `${containerWidth}px`;
//   }};
//   height: ${({ containerHeight = 400 }) => {
//     return `${containerHeight}px`;
//   }};
//   background: gray;
//   overflow: hidden;
//   position: absolute;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   top: 30px;
//   left: 0px;
// `;

const Pointer = styled.span<{
  x: number;
  y: number;
  // originLeft: number;
  // originTop: number;
  transition: boolean;
  width: number;
  height: number;
  ratio: number;
  offsetX: number;
  offsetY: number;
}>``;
//   position: absolute;
//   width: 2px;
//   height: 2px;
//   ${({ ratio, x, y, width, height, offsetX, offsetY }) => {
//     return `transform: translate(${(x - 0.5) * ratio * width +
//       offsetX}px, ${(y - 0.5) * ratio * height + offsetY}px);`;
//   }}
//   background: black;
//   border-radius: 2px;
//   ${({ transition }) => {
//     return transition ? 'transition: all 0.3s;' : null;
//   }}
// `;

// function getOffset(element: HTMLElement) {
//   const box = element.getBoundingClientRect();

//   return {
//     left: box.left + (window.pageXOffset - document.documentElement.clientLeft),
//     top: box.top + (window.pageYOffset - document.documentElement.clientTop),
//   };
// }

function calculateFitSize(
  containerRect: ElementRect,
  width: number,
  height: number,
) {
  if (containerRect.width === 0 || containerRect.height === 0) {
    return containerRect;
  }
  const widthRatio = width / containerRect.width;
  const heightRatio = height / containerRect.height;
  const largerRatio = Math.max(widthRatio, heightRatio);
  const result = {} as ElementRect;
  if (largerRatio <= 1) {
    result.width = width;
    result.height = height;
  } else {
    result.width = width / largerRatio;
    result.height = height / largerRatio;
  }
  result.left = containerRect.left + (containerRect.width - result.width) / 2;
  result.top = containerRect.top + (containerRect.height - result.height) / 2;
  return result;
}

function checkBoundary(
  transform: Transform,
  contentRect: ElementRect,
  containerRect: ElementRect,
) {
  const scaleWidth = contentRect.width * transform.scale;
  const scaleHeight = contentRect.height * transform.scale;
  const scaleOffsetX = transform.scale * transform.translateX;
  const scaleOffsetY = transform.scale * transform.translateY;
  // const scaleRect: ElementRect = {
  //   left: contentRect.left + scaleOffsetX,
  //   top: contentRect.top + scaleOffsetY,
  //   width: scaleWidth,
  //   height: scaleHeight,
  // };
  const fixOffsetX = fixOffset(scaleOffsetX, scaleWidth, containerRect.width);
  const fixOffsetY = fixOffset(scaleOffsetY, scaleHeight, containerRect.height);
  return fixOffsetX === scaleOffsetX && fixOffsetY === scaleOffsetY;
}

function fixOffset(
  offset: number,
  contentWidth: number,
  containerWidth: number,
) {
  if (contentWidth <= containerWidth) {
    return 0;
  }
  const range = (contentWidth - containerWidth) / 2;
  if (offset >= -range && offset <= range) {
    return offset;
  }
  if (offset < -range) {
    return -range;
  }
  return range;
}
function fixBoundary(
  transform: Transform,
  contentRect: ElementRect,
  containerRect: ElementRect,
): Transform {
  const scaleWidth = contentRect.width * transform.scale;
  const scaleHeight = contentRect.height * transform.scale;
  const scaleOffsetX = transform.scale * transform.translateX;
  const scaleOffsetY = transform.scale * transform.translateY;
  // const scaleRect: ElementRect = {
  //   left: contentRect.left + scaleOffsetX,
  //   top: contentRect.top + scaleOffsetY,
  //   width: scaleWidth,
  //   height: scaleHeight,
  // };
  const fixOffsetX = fixOffset(scaleOffsetX, scaleWidth, containerRect.width);
  const fixOffsetY = fixOffset(scaleOffsetY, scaleHeight, containerRect.height);
  return {
    scale: transform.scale,
    translateX: fixOffsetX / transform.scale,
    translateY: fixOffsetY / transform.scale,
  };
}

// function fixRatio(ratio: number): number {
//   if (ratio < 0) {
//     return 0;
//   }
//   return Number(ratio.toFixed(2));
// }

class JuiZoomImage extends Component<JuiZoomProps, JuiZoomState> {
  static defaultProps = {
    ratio: 1,
  };

  private _zoomRef: RefObject<any> = createRef();
  private _containerRef: RefObject<any> = createRef();

  constructor(props: JuiZoomProps) {
    super(props);
    this.state = {
      isDragging: false,
      naturalWidth: 0,
      naturalHeight: 0,
      transform: {
        scale: 1,
        translateX: 0,
        translateY: 0,
      },
    };
  }

  onImageSizeLoad = (naturalWidth: number, naturalHeight: number) => {
    const { containerRect } = this.state;
    if (containerRect) {
      this.setState({
        naturalWidth,
        naturalHeight,
        contentRect: calculateFitSize(
          containerRect,
          naturalWidth,
          naturalHeight,
        ),
      });
    }
  }

  render() {
    const { containerWidth, containerHeight } = this.props;
    const {
      isDragging,
      naturalWidth,
      naturalHeight,
      containerRect,
      contentRect,
      transform,
    } = this.state;
    const divStyle = {
      width: containerWidth,
      height: containerHeight,
    };
    return (
      <div style={divStyle}>
        <DragArea
          onDragMove={({ distance, delta }) => {
            const [deltaX, deltaY] = delta;
            const newTranform = {
              ...transform,
              translateX: transform.translateX + deltaX / transform.scale,
              translateY: transform.translateY + deltaY / transform.scale,
            };
            this.setState({
              // isDragging: true,
              transform: fixBoundary(newTranform, contentRect!, containerRect!),
            });
          }}
          render={(withDragProps: WithDragProps) => {
            return (
              <ZoomComponent
                ref={this._zoomRef}
                transform={transform}
                onTransformChange={(transform: Transform) => {
                  this.setState({
                    transform: fixBoundary(
                      transform,
                      contentRect!,
                      containerRect!,
                    ),
                  });
                }}
                render={() => {
                  return (
                    <TransformImageView
                      src={this.props.src}
                      width={contentRect ? contentRect.width : 0}
                      height={contentRect ? contentRect.height : 0}
                      transition={!withDragProps.isDragging}
                      transform={transform}
                      onSizeLoad={this.onImageSizeLoad}
                    />
                  );
                }}
              />
            );
          }}
        />
        <ReactResizeDetector
          handleHeight={true}
          handleWidth={true}
          onResize={(width, height) => {
            console.log('-- onResize --: ', { width, height });
            const newContainerRect = {
              width,
              height,
              left: 0,
              top: 0,
            };
            this.setState({
              containerRect: newContainerRect,
              contentRect: calculateFitSize(
                newContainerRect,
                naturalWidth,
                naturalHeight,
              ),
            });
          }}
        />
        <div>
          <button
            onClick={() => {
              this._zoomRef.current.zoomStep(-0.1);
            }}
          >
            -
          </button>
          <span>{transform.scale}</span>
          <button
            onClick={() => {
              this._zoomRef.current.zoomStep(0.1);
            }}
          >
            +
          </button>
          <button
            onClick={() => {
              this.setState({
                transform: {
                  scale: 1,
                  translateX: 0,
                  translateY: 0,
                },
              });
            }}
          >
            reset
          </button>
        </div>
      </div>
    );
  }
}

export { JuiZoomImage, JuiZoomProps };
