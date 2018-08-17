/*
 * @Author: Lily.li (lily.li@ringcentral.com)
 * @Date: 2018-05-16 09:38:08
 * Copyright © RingCentral. All rights reserved.
 */

function isEmpty(text: string) {
  return !(text && text.trim());
}

function isAtMentions(value: string) {
  const atReg = /([^\w]|^)@\[\w+/;
  return atReg.test(value);
}

function compileAtMentionText(text: string) {
  const TextReg = new RegExp(
    `<a class='at_mention_compose' rel='{"id":(.*?)}'>@(.*?)</a>`);
  let renderedText = text;
  let res = TextReg.exec(renderedText);
  let users = [];

  while (res) {
    users = fUser(res, users);
    renderedText = fText(res, renderedText);
    res = TextReg.exec(renderedText);
  }

  return {
    users,
    text: renderedText,
  };
}

function compileQuoteText(
  atMentionText: string,
  currentUser: { display: string; id: number }) {
  const { text, users } = compileAtMentionText(atMentionText);
  const { display, id } = currentUser;
  const quoteHead = `@[${display}]:${id}: wrote:\n`;
  const quoteText = text.split('\n').reduce((qt, t) => {
    // filter empty line
    if (t.length) {
      // add '>' before last quote message
      if (t.charAt(0) === '>') {
        return `${qt}${t}\n`;
      }
      return `${qt}> ${t}\n`;
    }
    return `${qt}${t}`;
  },                                        '');
  const renderedText = `${quoteHead}${quoteText}\n`;

  users.push({
    display,
    id: Number(id),
  });

  return {
    users,
    text: renderedText,
  };
}

function fUser(res: string[], users: any[]) {
  const [, id, display] = res;
  users.push({
    display,
    id: Number(id),
  });
  return users;
}

function fText(res: string[], text: string) {
  let renderedText = text;
  const [match, id, display] = res;
  const replaceText = `@[${display}]:${id}:`;
  renderedText = renderedText.replace(match, replaceText);
  return renderedText;
}

function b64toFile(base64: string, fileName: string) {
  const block = base64.split(';');
  const contentType = block[0].split(':')[1];
  const b64Data = block[1].split(',')[1];

  const type = contentType || '';
  const size = 512;

  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += size) {
    const slice = byteCharacters.slice(offset, offset + size);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  const blob = new File(byteArrays, fileName, { type });
  return blob;
}

export {
  isEmpty,
  isAtMentions,
  compileAtMentionText,
  compileQuoteText,
  b64toFile,
};
