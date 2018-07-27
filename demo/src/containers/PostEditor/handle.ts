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
    `<a class='at_mention_compose' rel='{"id":(.*?)}'>@(.*?)</a>`
  );
  let renderedText = text;
  let res = TextReg.exec(renderedText);
  let users = [];

  while (res) {
    users = fUser(res, users);
    renderedText = fText(res, renderedText);
    res = TextReg.exec(renderedText);
  }

  return {
    text: renderedText,
    users
  };
}

function compileQuoteText(
  atMentionText: string,
  currentUser: { display: string; id: number }
) {
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
  }, '');
  let renderedText = `${quoteHead}${quoteText}\n`;

  users.push({
    id: Number(id),
    display
  });

  return {
    text: renderedText,
    users
  };
}

function fUser(res: string[], users: any[]) {
  let [, id, display] = res;
  users.push({
    id: Number(id),
    display
  });
  return users;
}

function fText(res: string[], text: string) {
  let renderedText = text;
  let [match, id, display] = res;
  const replaceText = `@[${display}]:${id}:`;
  renderedText = renderedText.replace(match, replaceText);
  return renderedText;
}

function b64toFile(base64: string, fileName: string) {
  let block = base64.split(';');
  let contentType = block[0].split(':')[1];
  let b64Data = block[1].split(',')[1];

  const type = contentType || '';
  const size = 512;

  let byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += size) {
    let slice = byteCharacters.slice(offset, offset + size);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  let blob = new File(byteArrays, fileName, { type: type });
  return blob;
}

export {
  isEmpty,
  isAtMentions,
  compileAtMentionText,
  compileQuoteText,
  b64toFile
};
