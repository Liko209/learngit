/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiViewerThumbnail, ThumbnailInfoType } from '../ViewerThumbnail';

storiesOf('Pattern/Viewer', module)
  .addDecorator(withInfoDecorator(JuiViewerThumbnail, { inline: true }))
  .add('ViewerThumbnail', () => {
    const handleSelected = (e: any, info: ThumbnailInfoType) => {};
    return (
      <div
        style={{
          display: 'flex',
          width: '268px',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#fff',
          padding: '20px 0',
        }}
      >
        <JuiViewerThumbnail thumbnailNumber={0} onSelected={handleSelected}>
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/800x400.png?text=Viewer+Thumbnail+image+placeholder"
          />
        </JuiViewerThumbnail>
        <JuiViewerThumbnail
          thumbnailNumber={1}
          selected={true}
          onSelected={handleSelected}
        >
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/800x200.png?text=Viewer+Thumbnail+image+placeholder"
          />
        </JuiViewerThumbnail>
        <JuiViewerThumbnail
          thumbnailNumber={2}
          selected={false}
          onSelected={handleSelected}
        >
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/350x500.png?text=Viewer+Thumbnail+image+placeholder"
          />
        </JuiViewerThumbnail>
      </div>
    );
  });
