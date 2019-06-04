import { action, observable, computed, comparer, runInAction } from 'mobx';
import { ColonEmojiProps, ColonEmojiViewProps } from './types';
import StoreViewModel from '@/store/ViewModel';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import Keys from 'jui/pattern/MessageInput/keys';
import { Quill } from 'react-quill';
import 'jui/pattern/Emoji';
import { INIT_CURRENT_INDEX } from '../Mention/constants';
import { CONVERSATION_TYPES } from '@/constants';
import { emojiIndex, EmojiData } from 'emoji-mart';
const DELAY = 300;
const canTriggerDefaultEventHandler = (vm: ColonEmojiViewModel) => {
  return vm.members.length && vm.open;
};

class ColonEmojiViewModel extends StoreViewModel<ColonEmojiProps>
  implements ColonEmojiViewProps {
  @observable
  currentIndex: number = 0;
  @observable
  open: boolean = false;
  @computed
  private get _id() {
    return this.props.id;
  }
  @observable
  searchTerm?: string;
  @observable
  members: any = [];
  private _denotationChar?: string;
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
  }

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
      key: Keys.DOWN,
      handler: this._downHandler(this),
    },
  ];

  private _canDoFuzzySearch: boolean = true;

  constructor(props: ColonEmojiProps) {
    super(props);
    this.reaction(
      () => ({ searchTerm: this.searchTerm, memberIds: this._memberIds }),
      async (data: { searchTerm?: string; memberIds: number[] }) => {
        if (this._canDoFuzzySearch || this.isEditMode) {
          await this._doFuzzySearchPersons(data);
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

  private _doFuzzySearchPersons = ({
    searchTerm,
  }: {
    searchTerm?: string;
    memberIds: number[];
  }) => {
    const term = searchTerm ? searchTerm.trim() : '';
    // @ts-ignore
    const res = emojiIndex.search(term) as EmojiData[];
    this.currentIndex = this.initIndex;
    this.members = this._formatEmojiData(res);
    if (res) {
      this.currentIndex = this.initIndex;
      this.members = this._formatEmojiData(res);
      runInAction(() => {});
    }
  }

  private _formatEmojiData(res: EmojiData[]) {
    const emojis: any = [];
    if (res) {
      res.forEach(emojiData => {
        emojis.push({
          displayName: emojiData.name,
          id: emojiData.id,
          entity: { first_name: emojiData.name },
        });
      });
    }
    return emojis;
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @action
  reset() {
    this._canDoFuzzySearch = false;
    this.open = false;
    this.currentIndex = 0;
    this.members = [];
  }
  @action
  private _escapeHandler(vm: ColonEmojiViewModel) {
    return function () {
      if (vm.open) {
        vm.open = false;
      }
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _upHandler(vm: ColonEmojiViewModel) {
    return function () {
      const size = vm.members.length + INIT_CURRENT_INDEX;
      const currentIndex = (vm.currentIndex + size - 1) % size;
      vm.currentIndex = currentIndex === 0 ? vm.members.length : currentIndex;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _downHandler(vm: ColonEmojiViewModel) {
    return function () {
      const size = vm.members.length + INIT_CURRENT_INDEX;
      const currentIndex = (vm.currentIndex + 1) % size;
      vm.currentIndex = currentIndex === 0 ? INIT_CURRENT_INDEX : currentIndex;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _selectHandler(vm: ColonEmojiViewModel) {
    return function () {
      if (!vm.open || !vm.members.length) {
        return true;
      }
      // @ts-ignore
      const quill: Quill = this.quill;
      const emojiModules = quill.getModule('emoji');
      emojiModules.select(
        vm.members[vm.currentIndex - vm.initIndex].id,
        vm.members[vm.currentIndex - vm.initIndex].displayName,
        vm._denotationChar,
      );
      vm.currentIndex = 0;
      vm.open = false;
      return false;
    };
  }

  @action
  selectHandler = (selectIndex: number) => {
    return () => {
      this.currentIndex = selectIndex;
      const { pid } = this.props;
      const query = pid
        ? `[data-id='${pid}'] .ql-container`
        : '.conversation-page>div>div>.quill>.ql-container';
      this._selectHandler(this).apply({
        quill: (document.querySelector(query) as any).__quill,
      });
    };
  }

  @action
  private _onColon = (
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
    this.open = true;
    this._denotationChar = denotationChar;
  }

  @computed
  get initIndex() {
    // because of title will within VL
    return this.isOneToOneGroup ? 0 : INIT_CURRENT_INDEX;
  }

  @computed
  get isOneToOneGroup() {
    return this.groupType === CONVERSATION_TYPES.NORMAL_ONE_TO_ONE;
  }

  @computed
  get ids() {
    return this.members.map((member: EmojiData) => member.id);
  }

  @computed
  get isEditMode() {
    return this.props.isEditMode;
  }

  @computed
  private get _memberIds() {
    return this._group.members || [];
  }

  colonEmojiOptions = {
    onColon: this._onColon,
    keyboardEventHandlers: this._keyboardEventHandlers,
  };
}

export { ColonEmojiViewModel };
