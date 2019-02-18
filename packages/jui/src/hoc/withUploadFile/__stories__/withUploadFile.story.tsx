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

const PreviewArea = styled.img`
  width: 200px;
  height: 200px;
  display: flex;
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
    state = {
      files: '',
      fileData: '',
      file: {},
    };

    private _fileChanged = (files: FileList) => {
      if (files.length > 0) {
        const file = files[0];
        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = () => {
          this.setState({ file, fileData: reader.result });
        };

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
      }
      this.setState({ files });
    }

    render() {
      const { fileData, file } = this.state;
      const f = file as File;
      return (
        <div>
          <AreaWithUploadFile
            multiple={multiple}
            accept={accept}
            onFileChanged={this._fileChanged}
          >
            Click me to upload file
          </AreaWithUploadFile>
          <div>
            Selected file: <br />
            name: {f.name} <br />
            size: {f.size} <br />
            lastModified: {f.lastModified} <br />
            type: {f.type} <br />
            <PreviewArea src={fileData} />
          </div>
        </div>
      );
    }
  }

  return <Demo />;
});
