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
  return input.toLowerCase().replace(/(?:^|\s|-)\S/g, x => x.toUpperCase());
}

export { toTitleCase };
