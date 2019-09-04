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
import { CONVERSATION_TYPES } from '@/constants';
import { TEAM_TEXT, TEAM_MENTION_ID } from './constants';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { isTeamId } from '../helper';
import 'jui/pattern/MessageInput/Mention';

const canTriggerDefaultEventHandler = (vm: MentionViewModel) => {
  return !(vm.membersId.length && vm.open);
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
  membersId: number[] = [];
  @observable
  membersDisplayName: string[] = [];
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
        if ((this._canDoFuzzySearch || this.isEditMode) && this.open) {
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
    this.membersId = [];
    this.membersDisplayName = [];
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
    const res = await searchService.doFuzzySearchPersons(term, {
      excludeSelf: true,
      arrangeIds: memberIds,
      fetchAllIfSearchKeyEmpty: true,
      recentFirst: true,
    });

    if (res) {
      runInAction(() => {
        this.currentIndex = 0;
        this.membersDisplayName = res.sortableModels.map(
          item => item.displayName,
        );
        this.membersId = res.sortableModels.map(item => item.id);
        if (
          this.isTeam &&
          this._group.canMentionTeam &&
          this.searchTermMatchTeam &&
          !this.isEditMode
        ) {
          this.membersId.unshift(this._group.id);
          this.membersDisplayName.unshift(TEAM_TEXT);
        }
      });
    }
  };

  @action
  private _selectHandler(vm: MentionViewModel) {
    return function() {
      if (!vm.open || !vm.membersId.length) {
        return true;
      }
      const isTeam = isTeamId(vm.membersId[vm.currentIndex]);
      // @ts-ignore
      const quill: Quill = this.quill;
      const mentionModules = quill.getModule('mention');
      mentionModules.select(
        isTeam ? TEAM_MENTION_ID : vm.membersId[vm.currentIndex],
        vm.membersDisplayName[vm.currentIndex],
        vm._denotationChar,
        isTeam,
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
      const size = vm.membersId.length;
      vm.currentIndex = (vm.currentIndex + size - 1) % size;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _downHandler(vm: MentionViewModel) {
    return function() {
      const size = vm.membersId.length;
      vm.currentIndex = (vm.currentIndex + 1) % size;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @computed
  get searchTermMatchTeam() {
    const searchTerm = this.searchTerm || '';
    return (
      searchTerm.trim() === '' ||
      TEAM_TEXT.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    );
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

  mentionOptions = {
    onMention: this._onMention,
    keyboardEventHandlers: this._keyboardEventHandlers,
  };
}

export { MentionViewModel };
