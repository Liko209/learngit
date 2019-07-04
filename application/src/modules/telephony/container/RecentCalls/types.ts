/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */
import { FetchSortableDataListHandler } from '@/store/base/fetch';
import { CallLog } from 'sdk/module/RCItems/callLog/entity/CallLog';
import { ScrollPosition } from 'jui/components/VirtualizedList/hooks';
import { IndexRange } from 'jui/components/VirtualizedList';

type Props = {};

type ViewProps = {
  isError: boolean;
  onErrorReload: () => void;
  listHandler?: FetchSortableDataListHandler<CallLog, string>;
  setRecentCallsScrollPosition: (scrollPosition: ScrollPosition) => void;
  recentCallsScrollPosition: ScrollPosition;
  increaseFocusIndex: () => void;
  decreaseFocusIndex: () => void;
  focusIndex: number;
  setRangeIndex: (range: IndexRange) => void;
  startIndex: number;
  stopIndex: number;
} & Props;

export { Props, ViewProps };
