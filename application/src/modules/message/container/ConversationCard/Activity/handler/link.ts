/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:52
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbNumeralsNounText from './text/buildVerbNumeralsNounText';
import buildVerbArticleNounText from './text/buildVerbArticleNounText';

export default function ({ ids }: { ids: number[] }) {
  return ids.length === 1
    ? buildVerbArticleNounText({
        verb: 'shared',
        noun: 'link',
      })
    : buildVerbNumeralsNounText({
        verb: 'shared',
        numerals: ids.length,
        noun: 'link',
      });
}
