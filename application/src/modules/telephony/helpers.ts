import { isFunction } from 'lodash';

/**
 * Moves the caret (cursor) position to the end of the specified text field.
 * HACK: `HTMLInputElement | any` to fix `createTextRange` missing in standard HTML spec
 */
export const focusCampo = (inputField: HTMLInputElement | any) => {
  if (!inputField) {
    return;
  }
  inputField.blur();

  if (isFunction(inputField.createTextRange as any)) {
    const FieldRange = (inputField.createTextRange as Function)();
    FieldRange.moveStart('character', inputField.value.length);
    FieldRange.collapse();
    FieldRange.select();
  } else if (inputField.selectionStart || inputField.selectionStart === 0) {
    const elemLen = inputField.value.length;
    inputField.selectionStart = elemLen;
    inputField.selectionEnd = elemLen;
  }
  requestAnimationFrame(() => {
    inputField && inputField.focus();
  });
};

export const getDisplayName = (t: Function, name?: string): string => (typeof name !== 'string'
  ? ''
  : name.length
    ? name
    : t('telephony.unknownCaller'));

export function sleep(timeout: number = 0) {
  let timer: any;
  const promise = new Promise(resolve => {
    timer = setTimeout(resolve, timeout);
  });
  return {
    timer,
    promise,
  };
}

export function toFirstLetterUpperCase(input: string) {
  return `${input[0].toUpperCase()}${input.slice(1, input.length)}`;
}
