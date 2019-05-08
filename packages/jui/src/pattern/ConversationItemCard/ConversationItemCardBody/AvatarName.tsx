/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 10:33:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, ellipsis, width } from '../../../foundation/utils/styles';
import { withHighlight } from '../../../hoc/withHighlight';

type Props = {
  Avatar: JSX.Element;
  name: string;
};

const StyledAvatarName = styled.div`
  display: flex;
  align-items: center;
  margin: ${spacing(0, 4, 0, 0)};
  & span {
    max-width: ${width(45)};
    ${ellipsis()};
  }
`;

const StyledName = styled.span`
  margin-left: ${spacing(1)};
`;

const JuiAvatarNameComponent = withHighlight(['name'])(
  ({ name, Avatar }: Props) => (
    <StyledAvatarName>
      {Avatar} <StyledName dangerouslySetInnerHTML={{ __html: name }} />
    </StyledAvatarName>
  ),
);

JuiAvatarNameComponent.displayName = 'JuiAvatarName';

const JuiAvatarName = memo(JuiAvatarNameComponent);

export { JuiAvatarName };
