import { Quill } from 'react-quill';

const Inline = Quill.import('blots/inline');

class SpanBlot extends Inline {
  static create() {
    return super.create();
  }

  static formats() {
    return true;
  }
}

SpanBlot.blotName = 'span';
SpanBlot.tagName = 'span';

Quill.register(SpanBlot);
