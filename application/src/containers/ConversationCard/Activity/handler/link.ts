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
      verb: 'item.activity.shared',
      noun: 'item.activity.link',
    })
    : buildVerbNumeralsNounText({
      verb: 'item.activity.shared',
      numerals: ids.length,
      noun: 'item.activity.link',
    });
}
