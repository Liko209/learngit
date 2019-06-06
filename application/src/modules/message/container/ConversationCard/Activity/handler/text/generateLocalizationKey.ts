/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-05-30 15:17:43
 * Copyright © RingCentral. All rights reserved.
 */

enum ActivityTextType {
  'verb-noun-adjective' = '[verb] [noun] [adjective]',
  'verb-noun-adjective-user' = '[verb] [noun] [adjective] for {{user}}',
  'verb-noun-numerals' = '[verb] [noun] {{number}}',
  'verb-noun' = '[verb] [noun]',
  'verb-noun-user' = '[verb] [noun] for {{user}}',
  'verb-article-noun' = '[verb] a [noun]', // {{noun, en-handle-an}}
  'verb-numerals-noun' = '[verb] {{count}} [noun]',
  'verb-numerals-prepositions-noun' = '[verb] {{count}}% of [noun]',
}

const keyWords = {
  verb: new RegExp('\\[verb\\]', 'g'),
  noun: new RegExp('\\[noun\\]', 'g'),
  adjective: new RegExp('\\[adjective\\]', 'g'),
};

function generateLocalizationKey(key: string, parameter: object) {
  let resultKey: string = ActivityTextType[key];
  Object.keys(keyWords).forEach((keyword: string) => {
    const value = parameter[keyword];
    if (value !== undefined) {
      resultKey = resultKey.replace(keyWords[keyword], value);
    }
  });
  return `item.activity.${resultKey}`;
}

export { generateLocalizationKey };
