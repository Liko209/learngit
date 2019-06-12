import { Person } from 'sdk/module/person/entity';
import { PhoneNumber } from 'sdk/module/phoneNumber/entity';

type SearchItem = {
  id: string;
  person?: Person;
  phoneNumber: PhoneNumber;
  directDial?: string;
};

type Direction = 'up' | 'down';

type SearchResult = SearchItem[];

type ContactSearchListProps = {};

type ContactSearchListViewProps = {
  displayedSearchResult: SearchResult;
  isSearching: boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: Direction, count: number) => Promise<void>;
  hasMore: () => boolean;
  focusIndex: number;
  increaseFocusIndex: () => void;
  decreaseFocusIndex: () => void;
  onEnter: () => void;
  onClick: (focusIndex: number) => void;
  dialerFocused: boolean;
};

export {
  ContactSearchListProps,
  ContactSearchListViewProps,
  SearchResult,
  SearchItem,
  Direction,
};
