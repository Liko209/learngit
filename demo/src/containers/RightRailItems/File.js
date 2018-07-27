/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-05-24 21:31:46
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { LinkItem } from './Link';

const FileItem = LinkItem.extend``;

const File = props => {
  const { name } = props;
  return (
    <FileItem>
      <div className="title">[File] {name}</div>
    </FileItem>
  );
};

export default File;
