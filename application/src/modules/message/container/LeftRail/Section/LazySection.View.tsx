import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import {
  JuiConversationList,
  JuiConversationListItemLoader,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '../../ConversationList/ConversationListItem';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { SECTION_TYPE } from './types';
import { QUERY_DIRECTION } from 'sdk/dao/constants';

type LazyListProps = { ids: number[] };

function hasMore() {
  return SectionGroupHandler.getInstance().hasMore(
    SECTION_TYPE.TEAM,
    QUERY_DIRECTION.NEWER,
  );
}

function LazySectionComponent({ ids }: LazyListProps) {
  const [isLoading, setLoading] = useState(false);

  const renderIds = ids;

  const ref: MutableRefObject<HTMLLIElement | null> = useRef(null);

  function onScrollBottom(entries: IntersectionObserverEntry[]) {
    if (hasMore()) {
      if (entries[0].isIntersecting && !isLoading) {
        setLoading(true);
        SectionGroupHandler.getInstance().fetchPagination(SECTION_TYPE.TEAM);
      }
    } else {
      setLoading(false);
    }
  }

  useEffect(function hookUpIntersectionObserver() {
    let observer: IntersectionObserver;
    if (ref.current) {
      observer = new IntersectionObserver(onScrollBottom, {
        threshold: 1,
      });
      observer.observe(ref.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  });

  useEffect(
    function updateLoadingState() {
      if (isLoading) {
        setLoading(false);
      }
    },
    [ids],
  );

  useEffect(function cleanUp() {
    SectionGroupHandler.getInstance().setLeftRailVisible(true);

    return () => SectionGroupHandler.getInstance().setLeftRailVisible(false);
  }, []);

  return (
    <JuiConversationList className="conversation-list-section-collapse">
      {renderIds.map((id: number, index: number) => {
        if (index === renderIds.length - 1) {
          return (
            <li ref={ref} key={id}>
              <ConversationListItem groupId={id} />
            </li>
          );
        }
        return <ConversationListItem key={id} groupId={id} />;
      })}
      {hasMore() && <JuiConversationListItemLoader />}
    </JuiConversationList>
  );
}

const LazySection = React.memo(LazySectionComponent);

export { LazySection };
