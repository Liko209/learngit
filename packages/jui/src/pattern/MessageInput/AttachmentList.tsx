/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-07 14:13:42
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../foundation/styled-components';

import { AttachmentItem, ITEM_STATUS } from './AttachmentItem';
import { height, spacing } from '../../foundation/utils/styles';

type ItemInfo = {
  id: number;
  name: string;
};

type AttachmentListProps = {
  files?: ItemInfo[];
  removeAttachment: (file: ItemInfo) => void;
};

const Wrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  max-height: ${height(45)};
  overflow-y: auto;
  margin: ${spacing(2, 0, 0)};
  padding: ${spacing(0.25, 0, 0, 0.25)};
`;

const AttachmentList: React.SFC<AttachmentListProps> = (
  props: AttachmentListProps,
) => {
  const { files = [], removeAttachment } = props;
  return (
    <Wrapper data-test-automation-id="attachment-list">
      {files.map((looper: ItemInfo, idx: number) => (
        <AttachmentItem
          status={ITEM_STATUS.NORMAL}
          name={looper.name}
          onClickDeleteButton={() => removeAttachment(looper)}
          key={idx}
        />
      ))}
    </Wrapper>
  );
};

export { AttachmentList, ItemInfo };
