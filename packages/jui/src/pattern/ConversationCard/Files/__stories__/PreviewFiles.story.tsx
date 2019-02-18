/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-30 09:53:07
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  RefObject,
  createRef,
  CSSProperties,
  PureComponent,
} from 'react';
import { storiesOf } from '@storybook/react';
import { text, number } from '@storybook/addon-knobs';
import {
  JuiPreviewImage,
  JuiFileWithExpand,
  JuiFileWithPreview,
  JuiExpandImage,
} from '../';
import { JuiIconButton } from '../../../../components/Buttons/IconButton/IconButton';
import { getThumbnailSize } from '../../../../foundation/utils/calculateImageSize';

storiesOf('Pattern/ConversationCard', module).add('PreviewFiles', () => {
  const fileName = text(
    'filename',
    'Conversation Card ConversationConversation Card VxD.pdf',
  );
  return (
    <div>
      <div>
        {[1, 2, 3].map((id: number) => {
          return (
            <JuiPreviewImage
              key={id}
              url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              width={360}
              height={202}
              fileName={fileName}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  download
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithPreview
              key={id}
              url="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              fileName={fileName}
              size="2.3Mb"
              iconType={'pdf'}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  download
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithExpand
              icon="default_file"
              key={id}
              fileName={fileName}
              Actions={
                <JuiIconButton variant="plain" tooltipTitle="download">
                  download
                </JuiIconButton>
              }
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiExpandImage
              key={id}
              icon="file"
              fileName={fileName}
              i18UnfoldLess="less"
              i18UnfoldMore="more"
              previewUrl="https://material-ui.com/static/images/cards/contemplative-reptile.jpg"
              Actions={
                <>
                  <JuiIconButton variant="plain" tooltipTitle="download">
                    download
                  </JuiIconButton>
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
});

function randomColor(): string {
  const colorList: string[] = [
    '#8E2DE2',
    '#4286f4',
    '#f7797d',
    '#7F7FD5',
    '#0F2027',
  ];
  const index = Math.floor(Math.random() * colorList.length);
  return colorList[index];
}

storiesOf('Pattern/ConversationCard', module).add(
  'PreviewFileThumbnail',
  () => {
    const inputWidth = number('width', 180);
    const inputHeight = number('height', 180);

    type ThumbnailProps = {
      width: number;
      height: number;
      title: string;
    };

    class Thumbnail extends PureComponent<ThumbnailProps> {
      private _canvas: RefObject<HTMLCanvasElement> = createRef();
      private _image: any;

      componentDidMount() {
        const { width, height } = this.props;
        const { current } = this._canvas;
        if (current) {
          const ctx = current.getContext('2d');
          ctx!.fillStyle = randomColor();
          ctx!.fillRect(0, 0, width, height);
          this._image = current.toDataURL('image/png');
          this.forceUpdate();
        }
      }

      render() {
        const { title, width, height } = this.props;
        const size = getThumbnailSize(width, height);
        const contentStyle: CSSProperties = {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        };
        const wrapperStyle: CSSProperties = {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          margin: '10px',
        };
        const imageStyle: CSSProperties = {
          backgroundSize: 'cover',
          width: size.width,
          height: size.height,
        };
        const ratioString = `${(height / width).toFixed(2)} -> ${(
          size.height / size.width
        ).toFixed(2)}`;
        const sizeString = `${size.width} x ${
          size.height
        } (${width} x ${height} ${ratioString})`;
        const titleStyle: CSSProperties = {
          width: size.width,
          position: 'absolute',
          color: 'white',
          textAlign: 'center',
          fontSize: '11px',
        };
        return (
          <div style={contentStyle}>
            <div>{title}</div>
            {this._image && (
              <div style={wrapperStyle}>
                <img src={this._image} style={imageStyle} />
                <div style={titleStyle}>{sizeString}</div>
              </div>
            )}
            <canvas
              ref={this._canvas}
              width={width}
              height={height}
              style={{ display: 'none' }}
            />
          </div>
        );
      }
    }
    const wrapper: CSSProperties = {
      display: 'flex',
    };
    return (
      <div style={wrapper}>
        <Thumbnail title="case 1" width={175} height={70} />
        <Thumbnail title="case 2" width={160} height={90} />
        <Thumbnail title="case 2" width={160} height={300} />
        <Thumbnail title="case 3" width={200} height={187} />
        <Thumbnail title="case 4" width={400} height={700} />
        <Thumbnail title="case 4" width={700} height={400} />
        <Thumbnail title="case 5" width={700} height={10} />
        <Thumbnail title="case 6" width={10} height={70} />
        <Thumbnail title="dynamic" width={inputWidth} height={inputHeight} />
      </div>
    );
  },
);
