/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-03-13 16:49:00
 * Copyright © RingCentral. All rights reserved.
 */
import { Quill } from 'react-quill';

const Clipboard = Quill.import('modules/clipboard');
const Delta = Quill.import('delta');

class PlainClipboard extends Clipboard {
  onPaste(e: ClipboardEvent) {
    e.preventDefault();
    const range = this.quill.getSelection();
    const text = e.clipboardData.getData('text/plain');
    this.container.innerHTML = '';
    const delta = new Delta()
      .retain(range.index)
      .delete(range.length)
      .insert(text);
    const index = text.length + range.index;
    const length = 0;
    this.quill.updateContents(delta, 'user');
    this.quill.setSelection(index, length, 'silent');
    this.quill.scrollIntoView();
  }
}

Quill.register('modules/clipboard', PlainClipboard, true);
