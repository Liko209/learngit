/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 22:30:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { withUploadFile } from '../withUploadFile';
import { boolean, select } from '@storybook/addon-knobs';

const AreaDiv = styled.div`
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px dashed black;
`;

storiesOf('HoC/withUploadFile', module).add('demo', () => {
  const accept = select(
    'accept',
    {
      any: '*',
      audio: 'audio/*',
      video: 'video/*',
      image: 'image/*',
      pdf: 'application/pdf',
    },
    'image',
  );
  const multiple = boolean('multiple', true);

  const Area = (props: any) => {
    return <AreaDiv {...props} />;
  };

  const AreaWithUploadFile = withUploadFile(Area);

  class Demo extends PureComponent<any, any> {
    render() {
      return (
        <div>
          <AreaWithUploadFile multiple={multiple} accept={accept}>
            Click me to upload file
          </AreaWithUploadFile>
        </div>
      );
    }
  }

  return <Demo />;
});
