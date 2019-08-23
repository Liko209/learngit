/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-03-14 19:00:00,
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { spacing, shape, grey, palette } from '../../foundation/utils';
import { JuiConversationPostLikeProps } from './types';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconButton } from '../../components/Buttons';

const StyleConversationPostLike = styled.div`
  border: ${shape('border1')};
  border-color: ${grey('300')};
  border-radius: ${shape('borderRadius')};
  padding: ${spacing(1, 1.5)};
  display: inline-block;
  transition: ${({
    theme: {
      transitions: {
        duration: { shortest },
        easing: { easeIn },
        create,
      },
    },
  }) => `${create('all', { duration: shortest, easing: easeIn })}`};
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  color: ${palette('primary', 'main')};

  & > button {
    margin-right: ${spacing(1)};
    border-radius: 0;
  }

  & > span {
    color: ${grey('700')};
    font-size: ${spacing(3)};
  }

  &:hover {
    border-color: ${palette('primary', 'main')};
  }

  &:active {
    background-color: ${palette('primary', '50')};
  }
`;

class JuiConversationPostLike extends PureComponent<
  JuiConversationPostLikeProps
> {
  render() {
    const { likedUsersCount, title, iLiked, onClick } = this.props;

    const elEntity = (
      <StyleConversationPostLike data-name="footerLikeButton" onClick={onClick}>
        <JuiIconButton
          size="small"
          color={iLiked ? 'primary' : undefined}
          variant="plain"
          disableToolTip
          data-name="actionBarLike"
          data-test-automation-id="actionBarLike"
        >
          {iLiked ? 'thumbup' : 'thumbup_border'}
        </JuiIconButton>
        <span>{likedUsersCount}</span>
      </StyleConversationPostLike>
    );

    if (!title) return elEntity;

    return <RuiTooltip title={title}>{elEntity}</RuiTooltip>;
  }
}

export { JuiConversationPostLike };
