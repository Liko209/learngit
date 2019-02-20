/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:49
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbNounNumeralsText from './text/buildVerbNounNumeralsText';
import buildVerbNumeralsNounText from './text/buildVerbNumeralsNounText';
import buildVerbArticleNounText from './text/buildVerbArticleNounText';

export default function ({
  ids,
  itemData,
}: {
  ids: number[];
  itemData: { version_map: { [key: number]: number } };
}) {
  const version =
    itemData && itemData.version_map ? itemData.version_map[ids[0]] : 0;
  if (ids.length === 1) {
    return version > 1
      ? buildVerbNounNumeralsText({
        verb: 'item.activity.uploaded',
        noun: 'item.activity.version',
        numerals: version,
      })
      : buildVerbArticleNounText({
        verb: 'item.activity.shared',
        noun: 'item.activity.file',
      });
  }
  return buildVerbNumeralsNounText({
    verb: 'item.activity.shared',
    numerals: ids.length,
    noun: 'item.activity.file',
  });
}
