/*
 * @Author: Spike.Yang
 * @Date: 2019-07-24 15:08:15
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiTypography } from '../../foundation/Typography';
import { JuiMenuItem } from '../../components/Menus';
import { StyledAvatar } from '../../components/Avatar';
import {
  spacing,
  width,
  height,
  typography,
  ellipsis,
} from '../../foundation/utils';

type JuiDropdownContactInfoProps = {
  Avatar: React.ReactElement;
  name: string | undefined;
  content: string;
  openEditProfile: () => void;
};

const JuiStyledDropdown = styled('div')`
  width: ${width(61)};
  background: ${({ theme }) => theme.palette.background.paper};
`;

const StyledContactWrapper = styled('div')`
  display: flex;
  align-items: center;
  padding: ${spacing(3, 4)};
  background: ${({ theme }) => theme.palette.grey['100']};

  ${StyledAvatar} {
    :hover,
    :active {
      cursor: default;
      opacity: 1;
    }
  }
`;

const JuiStyledDropdownMenuItem = styled(JuiMenuItem)`
  && {
    font-size: ${spacing(3.5)};
    display: block;
    line-height: ${height(6)};
    ${ellipsis()};
    .emoji-mart-emoji {
      line-height: ${height(2.5)};
    }
  }
`;

const StyledContactInfoWrapper = styled('div')`
  flex: 1;
  width: ${width(39)};
  margin-left: ${spacing(4)};
  overflow: hidden;
`;

const StyledContactInfoName = styled(JuiTypography)`
  && {
    ${typography('subheading2')};
    ${ellipsis()};
    color: ${({ theme }) => theme.palette.grey['900']};
  }
`;

const StyledContactInfoEdit = styled('span')`
  && {
    ${typography('body1')};
    color: ${({ theme }) => theme.palette.primary['700']};
    cursor: pointer;
    transition: color 0.15s ease-in-out;
  }

  &&:hover {
    color: ${({ theme }) => theme.palette.primary['900']};
  }
`;

const JuiDropdownContactInfo = React.memo(
  (props: JuiDropdownContactInfoProps) => {
    const { Avatar, name, content, openEditProfile } = props;

    return (
      <StyledContactWrapper>
        {Avatar}
        <StyledContactInfoWrapper>
          {name && <StyledContactInfoName>{name}</StyledContactInfoName>}
          <StyledContactInfoEdit
            data-test-automation-id="dropMenuViewProfile"
            onClick={openEditProfile}
          >
            {content}
          </StyledContactInfoEdit>
        </StyledContactInfoWrapper>
      </StyledContactWrapper>
    );
  },
);

JuiStyledDropdown.displayName = 'JuiStyledDropdown';

export {
  JuiStyledDropdown,
  JuiDropdownContactInfoProps,
  JuiDropdownContactInfo,
  JuiStyledDropdownMenuItem,
};
