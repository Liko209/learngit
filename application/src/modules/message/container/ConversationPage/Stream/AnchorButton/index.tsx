import React, { useState, useEffect } from 'react';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { DIRECTION } from 'jui/components/Lists';
import { AnchorButtonWrapper } from '../AnchorButtonWrapper';
import { useTranslation } from 'react-i18next';
import { updateShowJumpToLatestButton } from './utils';

type Props = {
  firstHistoryUnreadInPage: boolean;
  historyUnreadCount: number;
  hasHistoryUnread: boolean;
  historyViewed: boolean | null;
  jumpToFirstUnreadLoading: boolean;
  jumpToLatest: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  jumpToFirstUnread: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
  isAboveScrollToLatestCheckPoint: boolean;
  hasMoreDown: boolean;
  isAtBottom: boolean | null;
};

function AnchorButton({
  firstHistoryUnreadInPage,
  hasHistoryUnread,
  historyUnreadCount,
  historyViewed,
  jumpToFirstUnreadLoading,
  jumpToFirstUnread,
  jumpToLatest,
  isAboveScrollToLatestCheckPoint,
  hasMoreDown,
  isAtBottom,
}: Props) {
  const { t } = useTranslation();
  let props;
  let text;
  const shouldHaveJumpToUnreadButton =
    hasHistoryUnread &&
    historyUnreadCount > 1 &&
    (!firstHistoryUnreadInPage || historyViewed === false);
  const [showJumpToLatestButton, setShowJumpToLatestButton] = useState(false);

  useEffect(() => {
    const _showJumpToLatestButton = updateShowJumpToLatestButton({
      isAboveScrollToLatestCheckPoint,
      isAtBottom,
      hasMoreDown,
      buttonShowed: showJumpToLatestButton,
    });
    if (_showJumpToLatestButton === null) return;
    if (_showJumpToLatestButton !== showJumpToLatestButton) {
      setShowJumpToLatestButton(_showJumpToLatestButton);
    }
  }, [isAtBottom, hasMoreDown, isAboveScrollToLatestCheckPoint]);

  if (shouldHaveJumpToUnreadButton) {
    text = `${historyUnreadCount > 99 ? '99+' : String(historyUnreadCount)} ${t(
      'message.stream.newMessages',
    )}`;
    props = {
      onClick: jumpToFirstUnread,
      loading: jumpToFirstUnreadLoading,
      arrowDirection: DIRECTION.UP,
      'data-test-automation-id': 'jump-to-first-unread-button',
    };
  } else if (showJumpToLatestButton) {
    text = `${t('message.stream.jumpToLatest')}`;
    props = {
      onClick: jumpToLatest,
      arrowDirection: DIRECTION.DOWN,
      'data-test-automation-id': 'jump-to-most-recent-button',
    };
  } else {
    return null;
  }

  return (
    <AnchorButtonWrapper>
      <JuiLozengeButton {...props}>{text}</JuiLozengeButton>
    </AnchorButtonWrapper>
  );
}

export { AnchorButton };
