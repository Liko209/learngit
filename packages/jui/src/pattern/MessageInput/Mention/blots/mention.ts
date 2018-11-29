import { Quill } from 'react-quill';

const Embed = Quill.import('blots/embed');

export type MentionBlotData = {
  denotationChar: string;
  name: string;
  id: number;
};

class MentionBlot extends Embed {
  static create(data: MentionBlotData) {
    const node = super.create();
    const denotationChar = document.createElement('span');
    denotationChar.className = 'ql-mention-denotation-char';
    denotationChar.innerHTML = data.denotationChar;
    node.appendChild(denotationChar);
    node.innerHTML += data.name;
    return MentionBlot.setDataValues(node, data);
  }

  static setDataValues(element: any, data: MentionBlotData) {
    const domNode = element;
    Object.keys(data).forEach((key: any) => {
      domNode.dataset[key] = data[key];
    });
    return domNode;
  }

  static value(domNode: any) {
    return domNode.dataset;
  }
}

MentionBlot.blotName = 'mention';
MentionBlot.tagName = 'span';
MentionBlot.className = 'mention';

Quill.register(MentionBlot);
