/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { FileName } from './FileName';

type JuiPreviewImageProps = {
  Actions?: JSX.Element;
  fileName: string;
  ratio: number;
  url: string;
  progress?: number;
};

const JuiPreviewImage: React.SFC<JuiPreviewImageProps> = (
  props: JuiPreviewImageProps,
) => {
  const { Actions, ratio, fileName, url } = props;

  return (
    <Jui.ImageCard ratio={ratio}>
      <Jui.ImageMedia image={url} />
      <Jui.ImageFileInfo ratio={ratio} component="div">
        <b>
          <FileName filename={fileName} />
        </b>
        <Jui.FileActionsWrapper>{Actions}</Jui.FileActionsWrapper>
      </Jui.ImageFileInfo>
    </Jui.ImageCard>
  );
};

export { JuiPreviewImage, JuiPreviewImageProps };
