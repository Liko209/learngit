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
import download from '../../../../assets/jupiter-icon/icon-download.svg';
import image from './contemplative-reptile.jpg';

storiesOf('Pattern/ConversationCard', module).add('PreviewFiles', () => {
  const fileName = text(
    'filename',
    'Conversation Card ConversationConversation Card VxD.pdf',
  );

  const actions = [
    <JuiIconButton
      key="download"
      variant="plain"
      tooltipTitle="download"
      symbol={download}
    />,
  ];

  return (
    <div>
      <div>
        {[1, 2, 3].map((id: number) => {
          return (
            <JuiPreviewImage
              key={id}
              url={image}
              width={360}
              height={202}
              fileName={fileName}
              Actions={actions}
            />
          );
        })}
      </div>
      <div>
        {[1, 2, 3, 4].map((id: number) => {
          return (
            <JuiFileWithPreview
              key={id}
              url={image}
              fileName={fileName}
              size="2.3Mb"
              iconType={'pdf'}
              Actions={actions}
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
                <JuiIconButton
                  key="download"
                  variant="plain"
                  tooltipTitle="download"
                  symbol={download}
                />
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
              previewUrl={image}
              Actions={
                <>
                  <JuiIconButton
                    key="download"
                    variant="plain"
                    tooltipTitle="download"
                    symbol={download}
                  />
                </>
              }
            />
          );
        })}
      </div>
    </div>
  );
});

storiesOf('Pattern/ConversationCard', module).add(
  'PreviewFileThumbnail',
  () => {
    const inputWidth = number('width', 180);
    const inputHeight = number('height', 180);

    type ThumbnailProps = {
      width: number;
      height: number;
      title: string;
      color: string;
    };

    class Thumbnail extends PureComponent<ThumbnailProps> {
      private _canvas: RefObject<HTMLCanvasElement> = createRef();
      private _image: any;

      componentDidMount() {
        const { width, height, color } = this.props;
        const { current } = this._canvas;
        if (current) {
          const ctx = current.getContext('2d');
          ctx!.fillStyle = color;
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
        <Thumbnail title="case 1" width={175} height={70} color="#8E2DE2" />
        <Thumbnail title="case 2" width={160} height={90} color="#4286f4" />
        <Thumbnail title="case 2" width={160} height={300} color="#f7797d" />
        <Thumbnail title="case 3" width={200} height={187} color="#7F7FD5" />
        <Thumbnail title="case 4" width={400} height={700} color="#0F2027" />
        <Thumbnail title="case 4" width={700} height={400} color="#8E2DE2" />
        <Thumbnail title="case 5" width={700} height={10} color="#7F7FD5" />
        <Thumbnail title="case 6" width={10} height={70} color="#0F2027" />
        <Thumbnail
          title="dynamic"
          width={inputWidth}
          height={inputHeight}
          color=""
        />
      </div>
    );
  },
);
