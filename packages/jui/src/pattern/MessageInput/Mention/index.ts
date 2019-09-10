import { QuillOptionsStatic, RangeStatic, DeltaStatic, Sources } from 'quill';
import { Quill } from 'react-quill';
import './blots/mention';
import './blots/span';
import Keys from '../keys';

export type KeyboardEventHandler = {
  key: number;
  handler: (range: RangeStatic, context: any) => void;
};

type MentionOptions = {
  onMention(match: boolean, searchTerm?: string, mentionChar?: string): void;
  allowedChars?: RegExp;
  mentionDenotationChars?: string[];
  isolateCharacter?: boolean;
  keyboardEventHandlers?: KeyboardEventHandler[];
  minChars?: number;
  maxChars?: number;
  blankNoShow?: boolean;
};

type Options = QuillOptionsStatic & MentionOptions;

class Mention {
  private _quill: Quill;
  private _mentionCharPos: number;
  private _cursorPos: number;
  private _options: Options = {
    onMention: () => {},
    mentionDenotationChars: ['@'],
    allowedChars: /^[\s\S]*$/,
    minChars: 0,
    maxChars: 31,
    isolateCharacter: true,
    blankNoShow: true,
  };
  constructor(quill: Quill, options: Options) {
    Object.assign(this._options, options);
    this._quill = quill;
    this._quill.on('text-change', this.onTextChange.bind(this));
    this._quill.on('selection-change', this.onSelectionChange.bind(this));

    if (options.keyboardEventHandlers) {
      options.keyboardEventHandlers.forEach(
        (eventHandler: KeyboardEventHandler) => {
          const { key, handler } = eventHandler;
          this._quill.keyboard.addBinding({ key } as { key: any }, handler);
          if ([Keys.TAB, Keys.ENTER, Keys.ESCAPE].includes(key)) {
            const bindings = (this._quill.keyboard as any).bindings;
            if (Array.isArray(bindings[key])) {
              bindings[key].unshift(bindings[key].pop());
            }
          }
        },
      );
    }
  }

  private _hasValidChars(s: string) {
    return this._options.allowedChars!.test(s);
  }

  select(id: number, name: string, denotationChar: string, isTeam: boolean) {
    const data = {
      id,
      name,
      denotationChar,
      isTeam,
    };
    requestAnimationFrame(() => {
      this._quill.setSelection(this._cursorPos, 0);
      this._quill.deleteText(
        this._mentionCharPos,
        this._cursorPos - this._mentionCharPos,
        'silent',
      );
      this._quill.insertEmbed(this._mentionCharPos, 'mention', data, 'api');
      this._quill.insertText(this._mentionCharPos + 1, ' ', 'span', 'api');
      if (this.hasTeamMention()) {
        this.doRemoveStyleForMemberMention();
      }
      this._quill.setSelection(this._mentionCharPos + 2, 0, 'api');
    });
  }

  doRemoveStyleForMemberMention = () => {
    const contents = this._quill.getContents();
    const result: any[] = [];
    let isTeamMentionKept = false;
    let mentionCharPosDiff = 0;
    contents.ops &&
      contents.ops.forEach(delta => {
        if (delta && delta.insert.mention) {
          if (delta.insert.mention.isTeam === 'true' && !isTeamMentionKept) {
            result.push(delta);
            isTeamMentionKept = true;
            return;
          }
          result.push({
            insert: `${delta.insert.mention.denotationChar}${
              delta.insert.mention.name
            }`,
          });
          mentionCharPosDiff += delta.insert.mention.name.length;
        } else {
          result.push(delta);
        }
      });
    const deltaResult = { ops: result };
    this._mentionCharPos += mentionCharPosDiff;
    this._quill.setContents(deltaResult as DeltaStatic);
  };

  hasTeamMention = () => {
    const ops = this._quill.getContents().ops;
    let hasTeam = false;
    ops &&
      ops.forEach(delta => {
        if (
          delta &&
          delta.insert.mention &&
          delta.insert.mention.isTeam === 'true'
        ) {
          hasTeam = true;
        }
      });
    return hasTeam;
  };

  onSomethingChange = () => {
    const range = this._quill.getSelection();
    if (range == null) return;
    this._cursorPos = range.index;
    const startPos = Math.max(0, this._cursorPos - this._options.maxChars!);
    const beforeCursorPos = this._quill.getText(
      startPos,
      this._cursorPos - startPos,
    );
    const mentionCharIndex = this._options.mentionDenotationChars!.reduce(
      (prev, cur) => {
        const previousIndex = prev;
        const mentionIndex = beforeCursorPos.lastIndexOf(cur);

        return mentionIndex > previousIndex ? mentionIndex : previousIndex;
      },
      -1,
    );
    if (mentionCharIndex > -1) {
      if (
        this._options.isolateCharacter &&
        !(
          mentionCharIndex === 0 ||
          !!beforeCursorPos[mentionCharIndex - 1].match(/\s/g)
        )
      ) {
        this._options.onMention(false);
        return;
      }
      if (
        this._options.blankNoShow &&
        beforeCursorPos[mentionCharIndex + 1] &&
        beforeCursorPos[mentionCharIndex + 1].match(/\s/g)
      ) {
        this._options.onMention(false);
        return;
      }
      const mentionCharPos =
        this._cursorPos - (beforeCursorPos.length - mentionCharIndex);
      this._mentionCharPos = mentionCharPos;
      const textAfter = beforeCursorPos.substring(mentionCharIndex + 1);
      if (
        textAfter.length >= this._options.minChars! &&
        this._hasValidChars(textAfter)
      ) {
        const mentionChar = beforeCursorPos[mentionCharIndex];
        this._options.onMention(true, textAfter, mentionChar);
      } else {
        this._options.onMention(false);
      }
    } else {
      this._options.onMention(false);
    }
  };

  onTextChange(delta: DeltaStatic, oldContents: DeltaStatic, source: Sources) {
    if (source === 'user') {
      requestAnimationFrame(this.onSomethingChange);
    }
  }

  onSelectionChange(
    range: RangeStatic,
    oldRange: RangeStatic,
    source: Sources,
  ) {
    if (source !== 'user') {
      return;
    }
    if (range && range.length === 0) {
      this.onSomethingChange();
    } else {
      this._options.onMention(false);
    }
  }
}

Quill.register('modules/mention', Mention);
