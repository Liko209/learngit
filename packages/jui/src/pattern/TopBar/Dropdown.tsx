/*
 * @Author: Spike.Yang
 * @Date: 2019-07-24 15:08:15
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from '../../foundation/styled-components';
import { JuiTypography } from '../../foundation/Typography';
import { JuiMenuItem } from '../../components/Menus';
import { spacing, width, typography, ellipsis } from '../../foundation/utils';

type JuiDropdownContactInfoProps = {
  Avatar: React.ReactElement;
  name: string | undefined;
  content: string;
  openEditProfile: () => void;
  handleClick: () => void;
};

const JuiStyledDropdown = styled('div')`
  min-width: ${width(30)};
  transition: width 0.2s ease;
  background: ${({ theme }) => theme.palette.background.paper};
  cursor: pointer;
`;

const StyledContactWrapper = styled('div')`
  display: flex;
  align-items: center;
  padding: ${spacing(3, 4)};
  width: ${width(61)};
  box-sizing: border-box;
  background: ${({ theme }) => theme.palette.grey['100']};
`;

const JuiStyledDropdownMenuItem = styled(JuiMenuItem)`
  && {
    font-size: ${spacing(3.5)};
  }
`;

const StyledContactInfoWrapper = styled('div')`
  flex: 1;
  width: ${width(39)};
  margin-left: ${spacing(4)};
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
    const { Avatar, name, content, openEditProfile, handleClick } = props;
    const _ref = React.useRef<HTMLDivElement>(null);

    const _clickEventHandler = React.useCallback(
      (event: React.SyntheticEvent) => {
        if (!_ref.current || !event.target) {
          return;
        }

        if (_ref.current === event.target) return;

        handleClick();
      },
      [],
    );

    return (
      <StyledContactWrapper
        data-test-automation-id="dropMenuEditProfile"
        onClick={_clickEventHandler}
      >
        {Avatar}
        <StyledContactInfoWrapper>
          {name && <StyledContactInfoName>{name}</StyledContactInfoName>}
          <StyledContactInfoEdit
            ref={_ref}
            data-test-automation-id="avatarEditProfile"
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
