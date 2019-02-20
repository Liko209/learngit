/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:42
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbArticleNounText from './text/buildVerbArticleNounText';

export default function () {
  return buildVerbArticleNounText({
    verb: 'item.activity.started',
    noun: 'item.activity.audio conference',
  });
}
