/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbNounText from './text/buildVerbNounText';

export default function (source: string) {
  return buildVerbNounText({
    verb: 'item.activity.via',
    noun: source,
  });
}
