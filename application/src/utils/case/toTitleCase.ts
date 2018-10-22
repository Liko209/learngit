/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-28 18:38:52
 * Copyright © RingCentral. All rights reserved.
 */

/**
 * Change to title case
 * toTitleCase('foo bar'); //=> 'Foo Bar'
 */
function toTitleCase(input: string) {
  const allTitleCase = input.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
  const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|v.?|vs.?|via)$/i;
  const wordSeparators = /([ :–—-])/;
  return allTitleCase.split(wordSeparators).map((current) => {
    if (current.search(smallWords) > -1) {
      return current.toLowerCase();
    }
    return current;
  }).join('');
}

export { toTitleCase };
