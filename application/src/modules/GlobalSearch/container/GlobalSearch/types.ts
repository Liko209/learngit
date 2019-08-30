/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:48:53
 * Copyright © RingCentral. All rights reserved.
 */
import { SEARCH_VIEW } from '../../types';

type GlobalSearchProps = {};

type GlobalSearchViewProps = {
  open: boolean;
  currentView: SEARCH_VIEW;
  searchKey: string;
  onClose: () => void;
  onChange: (value: string) => void;
  onClear: () => void;
  showClear: boolean;
  needFocus: boolean;
  onBlur: () => void;
};

export { GlobalSearchProps, GlobalSearchViewProps, SEARCH_VIEW };
