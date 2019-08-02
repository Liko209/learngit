/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-26 19:41:53
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed, comparer, runInAction } from 'mobx';
import { MentionProps, MentionViewProps } from './types';
import StoreViewModel from '@/store/ViewModel';
import { SearchService } from 'sdk/module/search';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import Keys from 'jui/pattern/MessageInput/keys';
import { Quill } from 'react-quill';
import 'jui/pattern/MessageInput/Mention';
import { CONVERSATION_TYPES } from '@/constants';
import {TEAM_TEXT} from './constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

type searchMember = {
  displayName: string;
  id: number;
};

const canTriggerDefaultEventHandler = (vm: MentionViewModel) => {
  if (vm.members.length && vm.open) {
    return false;
  }
  return true;
};

const DELAY = 300;
class MentionViewModel extends StoreViewModel<MentionProps>
  implements MentionViewProps {
  @computed
  private get _id() {
    return this.props.id;
  }
  @observable
  open: boolean = false;
  @observable
  currentIndex: number = 0;
  @observable
  members: searchMember[] = [];
  @observable
  searchTerm?: string;

  private _canDoFuzzySearch: boolean = true;

  private _denotationChar?: string;

  private _keyboardEventHandlers = [
    {
      key: Keys.ENTER,
      handler: this._selectHandler(this),
    },
    {
      key: Keys.ESCAPE,
      handler: this._escapeHandler(this),
    },
    {
      key: Keys.UP,
      handler: this._upHandler(this),
    },
    {
      key: Keys.TAB,
      handler: this._selectHandler(this),
    },
    {
      key: Keys.DOWN,
      handler: this._downHandler(this),
    },
  ];

  constructor(props: MentionProps) {
    super(props);
    this.reaction(
      () => ({ searchTerm: this.searchTerm, memberIds: this._memberIds }),
      (data: { searchTerm?: string; memberIds: number[] }) => {
        if (this._canDoFuzzySearch || this.isEditMode) {
          this._doFuzzySearchPersons(data);
        }
        this._canDoFuzzySearch = true;
      },
      {
        delay: this.searchTerm ? DELAY : 0,
        equals: comparer.structural,
      },
    );
    this.reaction(
      () => this.props.id,
      () => {
        this.reset();
      },
    );
  }

  @action
  reset() {
    this._canDoFuzzySearch = false;
    this.searchTerm = undefined;
    this.open = false;
    this.currentIndex = 0;
    this.members = [];
  }

  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @computed
  private get _memberIds() {
    return this._group.members || [];
  }

  @action
  private _onMention = (
    match: boolean,
    searchTerm: string,
    denotationChar: string,
  ) => {
    if (searchTerm !== undefined) {
      this.searchTerm =
        this.searchTerm === searchTerm ? `${searchTerm} ` : searchTerm;
    }
    if (!match) {
      this.open = false;
      return;
    }
    const data = { searchTerm: this.searchTerm, memberIds: this._memberIds };
    this._doFuzzySearchPersons(data);
    this.open = true;
    this._denotationChar = denotationChar;
  };

  private _doFuzzySearchPersons = async ({
    searchTerm,
    memberIds,
  }: {
    searchTerm?: string;
    memberIds: number[];
  }) => {
    const term = searchTerm ? searchTerm.trim() : '';
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const res = await searchService.doFuzzySearchPersons({
      searchKey: term,
      excludeSelf: true,
      arrangeIds: memberIds,
      fetchAllIfSearchKeyEmpty: true,
    });

    if (res) {
      runInAction(() => {
        this.currentIndex = 0;
        this.members = res.sortableModels;
        if (this.isTeam && this.searchTermMatchTeam && !this.isEditMode) {
          this.members.unshift({ displayName: TEAM_TEXT, id: this._group.id });
        }
      });
    }
  };

  @action
  private _selectHandler(vm: MentionViewModel) {
    return function() {
      if (!vm.open || !vm.members.length) {
        return true;
      }
      // @ts-ignore
      const quill: Quill = this.quill;
      const mentionModules = quill.getModule('mention');
      mentionModules.select(
        vm.members[vm.currentIndex].id,
        vm.members[vm.currentIndex].displayName,
        vm._denotationChar,
      );
      vm.currentIndex = 0;
      vm.open = false;
      return false;
    };
  }

  @action
  selectHandler = (selectIndex: number) => () => {
    this.currentIndex = selectIndex;
    const { pid } = this.props;
    const query = pid
      ? `[data-id='${pid}'] .ql-container`
      : '.conversation-page>div>div>.quill>.ql-container';
    this._selectHandler(this).apply({
      quill: (document.querySelector(query) as any).__quill,
    });
  };

  @action
  private _escapeHandler(vm: MentionViewModel) {
    return function() {
      if (vm.open) {
        vm.open = false;
      }
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _upHandler(vm: MentionViewModel) {
    return function() {
      const size = vm.members.length;
      vm.currentIndex = (vm.currentIndex + size - 1) % size;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _downHandler(vm: MentionViewModel) {
    return function() {
      const size = vm.members.length;
      vm.currentIndex = (vm.currentIndex + 1) % size;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @computed
  get searchTermMatchTeam() {
    const searchTerm = this.searchTerm || '';
    return searchTerm.trim() === '' || (TEAM_TEXT.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1)
  }

  @computed
  get isOneToOneGroup() {
    return this.groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
  }

  @computed
  get isTeam() {
    return this.groupType === CONVERSATION_TYPES.TEAM;
  }

  @computed
  get isEditMode() {
    return this.props.isEditMode;
  }

  @computed
  get ids() {
    return this.members.map((member: searchMember) => member.id);
  }

  mentionOptions = {
    onMention: this._onMention,
    keyboardEventHandlers: this._keyboardEventHandlers,
  };
}

export { MentionViewModel };
