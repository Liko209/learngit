import { RangeStatic } from 'quill';
import Parchment from 'parchment';

const { Scope } = Parchment;

function handleEnter(range: RangeStatic, context: any) {
  // @ts-ignore
  const quill = this.quill;
  if (range.length > 0) {
    quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
  }
  const lineFormats = Object.keys(context.format).reduce((formats, format) => {
    if (
      quill.scroll.query(format, Scope.BLOCK) &&
      !Array.isArray(context.format[format])
    ) {
      formats[format] = context.format[format];
    }
    return formats;
  },                                                     {});
  quill.insertText(range.index, '\n', lineFormats, 'user');
  // Earlier scroll.deleteAt might have messed up our selection,
  // so insertText's built in selection preservation is not reliable
  quill.setSelection(range.index + 1, 'silent');
  quill.focus();
  Object.keys(context.format).forEach((name: string) => {
    if (lineFormats[name] != null) return;
    if (Array.isArray(context.format[name])) return;
    if (name === 'link') return;
    quill.format(name, context.format[name], 'user');
  });
}

const keyboardEventDefaultHandler = {
  defaultEnter: {
    key: 13,
    ctrlKey: true,
    handler: handleEnter,
  },
};

export default keyboardEventDefaultHandler;
