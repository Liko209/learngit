/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 11:18:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';
import { JuiIconButton } from '../../components/Buttons';

import { spacing, palette, height } from '../../foundation/utils/styles';

type Props = {
  likeTooltipTitle: string;
  unlikeTooltipTitle: string;
  bookmarkTooltipTitle: string;
  removeBookmarkTooltipTitle: string;
  moreTooltipTitle: string;
  isLike: boolean;
  isBookmark: boolean;
  handleLikeButton: (toLike: boolean) => Promise<void>;
  handleBookmarkButton: (toBookmark: boolean) => Promise<void>;
};

const StyledWrapper = styled('div')`
  && {
    position: absolute;
    right: ${spacing(2)};
    top: ${spacing(1.5)};
    height: ${height(7)};
    padding: 0 ${spacing(1.5)};
    border-radius: ${spacing(4)};
    background-color: ${palette('common', 'white')};
    transition: box-shadow 0.3s ease-in;
    box-shadow: ${props => props.theme.shadows[1]};
    &:hover {
      box-shadow: ${props => props.theme.shadows[5]};
    }
    & > div {
      width: ${height(7)};
      text-align: center;
    }
  }
`;

class JuiConversationActionBar extends PureComponent<Props> {
  private _handleLikeButton = () => {
    const { isLike, handleLikeButton } = this.props;
    handleLikeButton(!isLike);
  }

  private _handleBookmarkButton = () => {
    const { isBookmark, handleBookmarkButton } = this.props;
    handleBookmarkButton(!isBookmark);
  }

  render() {
    const {
      likeTooltipTitle,
      unlikeTooltipTitle,
      bookmarkTooltipTitle,
      removeBookmarkTooltipTitle,
      moreTooltipTitle,
      isLike,
      isBookmark,
    } = this.props;
    return (
      <StyledWrapper>
        <JuiIconButton
          size="small"
          tooltipTitle={isLike ? unlikeTooltipTitle : likeTooltipTitle}
          color={isLike ? 'primary' : undefined}
          onClick={this._handleLikeButton}
          variant="plain"
        >
          thumb_up
        </JuiIconButton>
        <JuiIconButton
          size="small"
          tooltipTitle={
            isBookmark ? removeBookmarkTooltipTitle : bookmarkTooltipTitle
          }
          color={isBookmark ? 'primary' : undefined}
          onClick={this._handleBookmarkButton}
          variant="plain"
        >
          {isBookmark ? 'bookmark' : 'bookmark_border'}
        </JuiIconButton>
        <JuiIconButton
          size="small"
          tooltipTitle={moreTooltipTitle}
          variant="plain"
        >
          more_horiz
        </JuiIconButton>
      </StyledWrapper>
    );
  }
}

export { JuiConversationActionBar };
