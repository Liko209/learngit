/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiViewerPage } from '../ViewerPage';

storiesOf('Pattern/Viewer', module)
  .addDecorator(withInfoDecorator(JuiViewerPage, { inline: true }))
  .add('ViewerPage', () => {
    return (
      <div>
        <JuiViewerPage>
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/800x600.png?text=Viewer+Page+image+placeholder"
          />
        </JuiViewerPage>
        <JuiViewerPage>
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/800x600.png?text=Viewer+Page+image+placeholder"
          />
        </JuiViewerPage>
        <JuiViewerPage>
          <img
            style={{ width: '100%' }}
            src="https://via.placeholder.com/800x600.png?text=Viewer+Page+image+placeholder"
          />
        </JuiViewerPage>
      </div>
    );
  });
