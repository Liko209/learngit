/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 11:18:22
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../foundation/utils/decorators';

import { JuiConversationActionBar } from '..';

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
      handleLike: () => alert('handleLike'),
      handleUnlike: () => alert('handleUnlike'),
      handleBookmark: () => alert('handleBookmark'),
      handleRemoveBookmark: () => alert('handleRemoveBookmark'),
    };
    return <JuiConversationActionBar {...props} />;
  });
