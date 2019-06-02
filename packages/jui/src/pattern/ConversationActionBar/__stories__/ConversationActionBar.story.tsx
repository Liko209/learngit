/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiConversationActionBar } from '..';
import { JuiIconButton } from '../../../components/Buttons';
import thumbup from '../../../assets/jupiter-icon/icon-thumbup.svg';

const Action = () => (
  <JuiIconButton
    size="small"
    tooltipTitle="tooltip"
    color={'primary'}
    onClick={() => ''}
    variant="plain"
    data-name="actionBarLike"
    symbol={thumbup}
  />
);

storiesOf('Pattern', module)
  .addDecorator(withInfoDecorator(JuiConversationActionBar, { inline: true }))
  .add('ConversationActionBar', () => {
    const props = {
      likeTooltipTitle: 'Like',
      unlikeTooltipTitle: 'Unlike',
      bookmarkTooltipTitle: 'Bookmark',
      removeBookmarkTooltipTitle: 'Remove bookmark',
      moreTooltipTitle: 'More',
      isLike: false,
      isBookmark: true,
      More: <Action />,
      Like: <Action />,
      Bookmark: <Action />,
      Pin: <Action />,
      handleLike: () => alert('handleLike'),
      handleUnlike: () => alert('handleUnlike'),
      handleBookmark: () => alert('handleBookmark'),
      handleRemoveBookmark: () => alert('handleRemoveBookmark'),
    };
    return (
      <div style={{ position: 'relative' }}>
        <JuiConversationActionBar {...props} />
      </div>
    );
  });
