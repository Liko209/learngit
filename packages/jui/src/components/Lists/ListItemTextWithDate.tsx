/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 11:16:13
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils/styles';
import { getListItemTextWithDate } from '../../foundation/utils/getFileName';

type JuiListItemTextWithDateProps = {
  text: string;
};

const ListItemTextWithDateWrapper = styled('div')`
  display: flex;
  min-width: 0;
  align-items: center;
  ${ellipsis};
`;

const LeftName = styled.span`
  ${ellipsis};
`;

const JuiListItemTextWithDate = (Props: JuiListItemTextWithDateProps) => {
  const { text } = Props;
  const [left, right] = getListItemTextWithDate(text);

  return (
    <ListItemTextWithDateWrapper data-test-automation-id="list-item-text-with-date">
      <LeftName>{left}&nbsp;</LeftName>
      <span>·&nbsp;{right}</span>
    </ListItemTextWithDateWrapper>
  );
};

export { JuiListItemTextWithDate, JuiListItemTextWithDateProps };
