/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-08 16:02:04
 * Copyright © RingCentral. All rights reserved.
 */

import { QuillOptionsStatic, RangeStatic, DeltaStatic, Sources } from 'quill';
import { Quill } from 'react-quill';
import Keys from './keys';

type KeyboardEventHandler = {
  key: number;
  handler: (range: RangeStatic, context: any) => void;
};

type ColonEmojiOptions = {
  onColon(match: boolean, searchTerm?: string, colonChar?: string): void;
  allowedChars?: RegExp;
  colonDenotationChars?: string[];
  isolateCharacter?: boolean;
  keyboardEventHandlers?: KeyboardEventHandler[];
  minChars?: number;
  maxChars?: number;
  blankNoShow?: boolean;
};

type Options = QuillOptionsStatic & ColonEmojiOptions;

class ColonEmoji {
  private _quill: Quill;
  private _colonCharPos: number;
  private _cursorPos: number;
  private _options: Options = {
    onColon: () => {},
    colonDenotationChars: [':'],
    allowedChars: /^[a-zA-Z0-9_ ]*$/,
    minChars: 2,
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

  select(id: number, name: string, denotationChar: string) {
    const data = {
      id,
      name,
      denotationChar,
    };
    requestAnimationFrame(() => {
      this._quill.setSelection(this._cursorPos, 0);
      this._quill.deleteText(
        this._colonCharPos,
        this._cursorPos - this._colonCharPos,
        'api',
      );
      this._quill.insertEmbed(this._colonCharPos, 'colon', data, 'api');
      this._quill.insertText(this._colonCharPos + 1, ' ', 'api');
      this._quill.setSelection(this._colonCharPos + 2, 0, 'api');
    });
  }

  onSomethingChange = () => {
    const range = this._quill.getSelection();
    if (range == null) return;
    this._cursorPos = range.index;
    const startPos = Math.max(0, this._cursorPos - this._options.maxChars!);
    const beforeCursorPos = this._quill.getText(
      startPos,
      this._cursorPos - startPos,
    );
    const colonCharIndex = this._options.colonDenotationChars!.reduce(
      (prev, cur) => {
        const previousIndex = prev;
        const colonIndex = beforeCursorPos.lastIndexOf(cur);

        return colonIndex > previousIndex ? colonIndex : previousIndex;
      },
      -1,
    );
    if (colonCharIndex > -1) {
      if (
        this._options.isolateCharacter &&
        !(
          colonCharIndex === 0 ||
          !!beforeCursorPos[colonCharIndex - 1].match(/\s/g)
        )
      ) {
        this._options.onColon(false);
        return;
      }
      if (
        this._options.blankNoShow &&
        beforeCursorPos[colonCharIndex + 1] &&
        beforeCursorPos[colonCharIndex + 1].match(/\s/g)
      ) {
        this._options.onColon(false);
        return;
      }
      const colonCharPos =
        this._cursorPos - (beforeCursorPos.length - colonCharIndex);
      this._colonCharPos = colonCharPos;
      const textAfter = beforeCursorPos.substring(colonCharIndex + 1);
      if (
        textAfter.length >= this._options.minChars! &&
        this._hasValidChars(textAfter)
      ) {
        const colonChar = beforeCursorPos[colonCharIndex];
        this._options.onColon(true, textAfter, colonChar);
      } else {
        this._options.onColon(false);
      }
    } else {
      this._options.onColon(false);
    }
  }

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
      this._options.onColon(false);
    }
  }
}

Quill.register('modules/emoji', ColonEmoji);

export * from './Emoji';
