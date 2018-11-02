/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-26 10:35:16
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import * as Jui from './style';
import { getFileName } from '../../../foundation/utils/getFileName';

type JuiPreviewImageProps = {
  actions: JSX.Element;
  fileName: string;
  ratio: number;
  url: string;
};

const JuiPreviewImage: React.SFC<JuiPreviewImageProps> = (
  props: JuiPreviewImageProps,
) => {
  const { actions, ratio, fileName, url } = props;
  const [left, right] = getFileName(fileName);

  return (
    <Jui.ImageCard ratio={ratio}>
      <Jui.ImageMedia image={url} />
      <Jui.ImageFileInfo ratio={ratio} component="div">
        <b>
          <span className="left-name">{left}</span>
          <span className="right-name">{right}</span>
        </b>
        <Jui.FileActionsWrapper>{actions}</Jui.FileActionsWrapper>
      </Jui.ImageFileInfo>
    </Jui.ImageCard>
  );
};

export { JuiPreviewImage, JuiPreviewImageProps };
