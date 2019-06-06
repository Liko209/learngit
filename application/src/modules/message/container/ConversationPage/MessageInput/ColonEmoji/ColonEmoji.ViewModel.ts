import { action, observable, computed, comparer } from 'mobx';
import { ColonEmojiProps, ColonEmojiViewProps, MemberData } from './types';
import StoreViewModel from '@/store/ViewModel';
import Keys from 'jui/pattern/MessageInput/keys';
import { Quill } from 'react-quill';
import { ExcludeList, ConvertList } from 'jui/pattern/Emoji/excludeList';
import 'jui/pattern/Emoji';
import { emojiIndex, EmojiData } from 'emoji-mart';
const DELAY = 300;
const INIT_INDEX = 0;
const QUILL_QUERY = '.conversation-page>div>div>.quill>.ql-container';
const canTriggerDefaultEventHandler = (vm: ColonEmojiViewModel) => {
  return !(vm.members.length && vm.open);
};

class ColonEmojiViewModel extends StoreViewModel<ColonEmojiProps>
  implements ColonEmojiViewProps {
  @observable
  currentIndex: number = 0;
  @observable
  open: boolean = false;

  @observable
  searchTerm?: string;
  @observable
  members: any = [];
  private _denotationChar?: string;
  @observable
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
      () => ({ searchTerm: this.searchTerm }),
      async (data: { searchTerm?: string }) => {
        if (this._canDoFuzzySearch) {
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

  private _doFuzzySearchPersons = ({ searchTerm }: { searchTerm?: string }) => {
    const term = searchTerm ? searchTerm.trim() : '';
    // @ts-ignore
    const res = emojiIndex.search(term) as EmojiData[];
    if (res) {
      this.currentIndex = INIT_INDEX;
      this.members = this._formatEmojiData(res);
    }
  }

  private _doUnderscoreTransfer = (colons: string) => {
    return colons.split('-').join('_');
  }

  private _formatEmojiData(res: EmojiData[]) {
    const emojis: MemberData[] = [];
    if (res) {
      res.forEach(({ name, id }) => {
        let emojiId = id;
        if (emojiId && !(ExcludeList.indexOf(id as string) > -1)) {
          if (id && ConvertList.indexOf(id.split(':').join('')) > -1) {
            emojiId = this._doUnderscoreTransfer(id);
          }
          emojis.push({
            id,
            displayId: emojiId,
            displayName: name,
          });
        }
      });
    }
    return emojis;
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
      const size = vm.members.length;
      const currentIndex = (vm.currentIndex + size - 1) % size;
      vm.currentIndex = currentIndex < 0 ? vm.members.length : currentIndex;
      return canTriggerDefaultEventHandler(vm);
    };
  }

  @action
  private _downHandler(vm: ColonEmojiViewModel) {
    return function () {
      const size = vm.members.length;
      const currentIndex = (vm.currentIndex + 1) % size;
      vm.currentIndex = currentIndex < 0 ? 0 : currentIndex;
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
        vm.members[vm.currentIndex - INIT_INDEX].displayId,
        vm.members[vm.currentIndex - INIT_INDEX].displayName,
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
      const query = pid ? `[data-id='${pid}'] .ql-container` : QUILL_QUERY;
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
      this.searchTerm = searchTerm;
    }
    if (!match) {
      this.open = false;
      return;
    }
    this.open = true;
    this._denotationChar = denotationChar;
  }

  @computed
  get ids() {
    return this.members.map((member: EmojiData) => member.id);
  }

  colonEmojiOptions = {
    onColon: this._onColon,
    keyboardEventHandlers: this._keyboardEventHandlers,
  };
}

export { ColonEmojiViewModel };
