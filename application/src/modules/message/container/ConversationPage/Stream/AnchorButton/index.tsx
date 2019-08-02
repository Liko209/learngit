import React from 'react';
import { JuiLozengeButton } from 'jui/components/Buttons';
import { DIRECTION } from 'jui/components/Lists';
import { AnchorButtonWrapper } from '../AnchorButtonWrapper';
import { useTranslation } from 'react-i18next';

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
  hasMore: (direction: DIRECTION) => boolean;
  isAboveScrollToLatestCheckPoint: boolean;
};

const AnchorButton = React.memo(
  ({
    firstHistoryUnreadInPage,
    hasHistoryUnread,
    historyUnreadCount,
    historyViewed,
    jumpToFirstUnreadLoading,
    jumpToFirstUnread,
    jumpToLatest,
    isAboveScrollToLatestCheckPoint,
    hasMore,
  }: Props) => {
    let props;
    let text;
    const { t } = useTranslation();
    const shouldHaveJumpToUnreadButton =
      hasHistoryUnread &&
      historyUnreadCount > 1 &&
      (!firstHistoryUnreadInPage || historyViewed === false);
    if (shouldHaveJumpToUnreadButton) {
      text = `${
        historyUnreadCount > 99 ? '99+' : String(historyUnreadCount)
      } ${t('message.stream.newMessages')}`;
      props = {
        onClick: jumpToFirstUnread,
        loading: jumpToFirstUnreadLoading,
        arrowDirection: DIRECTION.UP,
        'data-test-automation-id': 'jump-to-first-unread-button',
      };
    } else if (isAboveScrollToLatestCheckPoint || hasMore(DIRECTION.DOWN)) {
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
  },
);

export { AnchorButton };
