/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-05-28 17:23:27
 * Copyright © RingCentral. All rights reserved.
 */

import {
  computed,
  reaction,
  observable,
  runInAction,
  IReactionDisposer,
  action,
} from 'mobx';
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { StoreViewModel } from '@/store/ViewModel';
import {
  ContactSearchListProps,
  ContactSearchListViewProps,
  SearchResult,
  SearchItem,
} from './types';
import {
  TELEPHONY_SERVICE,
  CONTACT_SEARCH_PHONE_NUMBER_ID,
} from '../../interface/constant';
import { SearchService } from 'sdk/module/search';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { debounce } from 'lodash';
import { mainLogger } from 'foundation/log';

const INITIAL_PAGE_SIZE = 10;
const ONE_FRAME = 1000 / 60;

enum Direction {
  UP = 'up',
  DOWN = 'down',
}

export class ContactSearchListViewModel
  extends StoreViewModel<ContactSearchListProps>
  implements ContactSearchListViewProps {
  private static _tag = '[UI] ContactSearchListViewModel';

  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _contactSearchDisposer: IReactionDisposer;
  private _isSearchingDisposer: IReactionDisposer;
  private _displayDisposer: IReactionDisposer;

  @observable
  displayIdx: number = 0;

  searchResult: SearchResult = [];

  @observable
  searchResultLength: number = 0;

  @observable
  timestamp: number = 0;

  @observable
  isSearching: boolean = false;

  @observable
  terms: string[];

  @observable
  focusIndex: number = -1;

  @observable
  shouldDisplayPhoneNumberItem: boolean = false;

  constructor(props: ContactSearchListProps) {
    super(props);

    this._contactSearchDisposer = reaction(
      () => this.trimmedInputString,
      this._searchReaction,
      {
        fireImmediately: true,
      },
    );

    this._isSearchingDisposer = reaction(
      () => this.trimmedInputString.length,
      (length: number) => {
        this.isSearching = !!length;
      },
      {
        fireImmediately: true,
      },
    );

    this._displayDisposer = reaction(
      () => this.timestamp,
      this.loadInitialData,
      {
        fireImmediately: true,
      },
    );
  }

  dispose = () => {
    this._contactSearchDisposer();
    this._isSearchingDisposer();
    this._displayDisposer();
    super.dispose();
  };

  @action
  increaseFocusIndex = () => {
    const next = this.focusIndex + 1;
    const maxIndex = this.searchResult.length - 1;
    this.focusIndex = next >= maxIndex ? maxIndex : next;
  };

  @action
  decreaseFocusIndex = () => {
    const next = this.focusIndex - 1;
    const minimumIndex = 0;
    this.focusIndex = next <= minimumIndex ? minimumIndex : next;
  };

  onClick = (focusIndex: number) => {
    this.focusIndex = focusIndex;
    this._telephonyStore.onDialerInputFocus();
    this.onEnter();
  };

  @computed
  get isTransferPage() {
    return this._telephonyStore.isTransferPage;
  }

  @computed
  get selectedCallItemIndex() {
    return this._telephonyStore.selectedCallItem.index;
  }

  @action
  selectCallItem = (phoneNumber: string, focusIndex?: number) => {
    // analyticsCollector.makeOutboundCall(ANALYTICS_SOURCE);
    if (this.selectedCallItemIndex === focusIndex) {
      this._telephonyStore.setCallItem('', NaN);
      return;
    }
    return this._telephonyStore.setCallItem(phoneNumber, focusIndex || 0);
  };

  @action
  onEnter = () => {
    if (!this.dialerInputFocused || this.isSearching) {
      return;
    }
    const res = this.searchResult[this.focusIndex];

    let phoneNumber;
    if (res) {
      const phoneNumberObj = res.phoneNumber;

      phoneNumber =
        (phoneNumberObj && phoneNumberObj.id) || (res.directDial as string);
    } else {
      mainLogger.debug(
        `${ContactSearchListViewModel._tag}: can not find index:${
          this.focusIndex
        } in search result. ${
          this.searchResult
        } in total:, the detail is: ${JSON.stringify(this.searchResult)}`,
      );
      phoneNumber = this.trimmedInputString;
    }
    if (this.isTransferPage) {
      return this.selectCallItem(phoneNumber, this.focusIndex);
    }
    return this.props.onContactSelected(phoneNumber);
  };

  @action
  private _setDefaultFocusIndex = async () => {
    this.focusIndex = this.shouldDisplayPhoneNumberItem ? 0 : -1;
  };

  private _searchReaction = debounce(
    async () => {
      let trimmedInputString = '';
      runInAction(() => {
        trimmedInputString = this.trimmedInputString;
        if (!trimmedInputString.length) {
          this.searchResult = [];
        }
      });
      const [currentSearchResult, parsedPhone] = await Promise.all([
        this._searchContacts(trimmedInputString),
        this._telephonyService.isValidNumber(trimmedInputString),
      ]);

      runInAction(() => {
        this.shouldDisplayPhoneNumberItem =
          parsedPhone.isValid && !this.isTransferPage;
        this.isSearching = false;
        const res = this.shouldDisplayPhoneNumberItem
          ? [
              {
                id: CONTACT_SEARCH_PHONE_NUMBER_ID,
                directDial: parsedPhone.toNumber,
              } as SearchItem,
            ]
          : [];
        this.searchResult = currentSearchResult
          ? [...res, ...currentSearchResult.phoneContacts]
          : res;

        this.searchResultLength = this.searchResult.length;
        this.terms = currentSearchResult ? currentSearchResult.terms : [];
        this.timestamp = +new Date();
        mainLogger.debug(
          `${ContactSearchListViewModel._tag}: get results for ${
            this.trimmedInputString
          }, ${this.searchResult.length} in total.`,
        );
      });
    },
    ONE_FRAME * 15,
    {
      leading: false,
      trailing: true,
    },
  );

  private _searchContacts = async (searchString: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );

    return searchService.doFuzzySearchPhoneContacts(searchString, {
      fetchAllIfSearchKeyEmpty: false,
      recentFirst: true,
      showExtensionOnly: true,
    });
  };

  private _getIdx = (idx: number) => {
    const maxIdx = this.searchResultLength - 1;
    return idx >= maxIdx ? maxIdx : idx;
  };

  // This method must be called after data being fetched
  loadInitialData = async () => {
    this.displayIdx = this._getIdx(INITIAL_PAGE_SIZE);
    this._setDefaultFocusIndex();
  };

  loadMore = async (direction: Direction, count: number) => {
    runInAction(() => {
      if (direction === Direction.UP) {
        return;
      }
      this.displayIdx = this._getIdx(this.displayIdx + count);
    });
  };

  @action
  hasMore = () => this.displayIdx < this.searchResultLength - 1;

  @computed
  get trimmedInputString() {
    return this._telephonyStore[this.props.inputStringProps].trim();
  }

  @computed
  get displayedSearchResult() {
    if (this.timestamp) {
      return this.searchResult.slice(0, this.displayIdx + 1);
    }
    return [];
  }

  @computed
  get dialerInputFocused() {
    return this._telephonyStore.dialerInputFocused;
  }
}
