import { isFunction } from 'lodash';

/*
 ** Returns the caret (cursor) position of the specified text field.
 ** Return value range is 0-inputField.value.length.
 */
export function doGetCaretPosition(inputField: HTMLInputElement | any) {
  // Initialize
  let iCaretPos = 0;

  // IE Support
  if ((document as any).selection) {
    // Set focus on the element
    inputField.focus();

    // To get cursor position, get empty selection range
    const oSel = (document as any).selection.createRange();

    // Move selection start to 0 position
    oSel.moveStart('character', -inputField.value.length);

    // The caret position is selection length
    iCaretPos = oSel.text.length;
  } else if (
    // Firefox support
    inputField.selectionStart ||
    inputField.selectionStart === '0'
  ) {
    iCaretPos =
      inputField.selectionDirection === 'backward'
        ? inputField.selectionStart
        : inputField.selectionEnd;
  }

  // Return results
  return iCaretPos;
}

/*
 ** Moves the caret (cursor) position to the end of the specified text field.
 */
export const focusCampo = (inputField: HTMLInputElement | any) => {
  // HACK: `HTMLInputElement | any` to fix `createTextRange` missing in standard HTML spec
  if (!inputField || (inputField && inputField.value.length === 0)) {
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

export const getDisplayName = (t: Function, name?: string): string => {
  return typeof name !== 'string'
    ? ''
    : name.length
    ? name
    : t('telephony.unknownCaller');
};

export function sleep(timeout: number = 0) {
  let timer: any;
  const promise = new Promise((resolve) => {
    timer = setTimeout(resolve, timeout);
  });
  return {
    timer,
    promise,
  };
}
