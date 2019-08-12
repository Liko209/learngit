/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-07 15:46:54
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useEffect, useRef, MutableRefObject } from 'react';
import {
  JuiConversationList,
  JuiConversationListItemLoader,
} from 'jui/pattern/ConversationList';
import { ConversationListItem } from '../../ConversationList/ConversationListItem';
import SectionGroupHandler from '@/store/handler/SectionGroupHandler';
import { SECTION_TYPE } from './types';
import { QUERY_DIRECTION } from 'sdk/dao/constants';
import 'intersection-observer';
import { Observer } from 'mobx-react';

type LazyListProps = { ids: number[] };

function hasMore() {
  return SectionGroupHandler.getInstance().hasMore(
    SECTION_TYPE.TEAM,
    QUERY_DIRECTION.NEWER,
  );
}

const onScrollBottom = async (entries: IntersectionObserverEntry[]) => {
  if (hasMore() && entries[0].isIntersecting) {
    SectionGroupHandler.getInstance().fetchPagination(SECTION_TYPE.TEAM);
  }
};

function LazySectionComponent({ ids }: LazyListProps) {
  const ref: MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(function hookUpIntersectionObserver() {
    let observer: IntersectionObserver;
    if (ref.current) {
      observer = new IntersectionObserver(onScrollBottom, {
        threshold: [0.1],
      });
      observer.observe(ref.current);
    }
    return () => {
      if (observer) observer.disconnect();
    };
  });

  useEffect(function lifeCycleHook() {
    SectionGroupHandler.getInstance().setLeftRailVisible(true);

    return () => SectionGroupHandler.getInstance().setLeftRailVisible(false);
  }, []);

  return (
    <JuiConversationList className="conversation-list-section-collapse">
      {ids.map((id: number) => {
        return <ConversationListItem key={id} groupId={id} />;
      })}
      <Observer>
        {() =>
          hasMore() && (
            <div ref={ref} key="loader">
              <JuiConversationListItemLoader />
            </div>
          )
        }
      </Observer>
    </JuiConversationList>
  );
}

const LazySection = React.memo(LazySectionComponent);

export { LazySection };
