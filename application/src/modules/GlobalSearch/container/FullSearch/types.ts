/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { TAB_TYPE } from '../../types';

type FullSearchProps = {};

type FullSearchViewProps = {
  currentTab: TAB_TYPE;
  setCurrentTab: (tab: TAB_TYPE) => void;
  jumpToConversationCallback: () => void;
  resetSearchScope(): void;
};

export { FullSearchProps, FullSearchViewProps, TAB_TYPE };
