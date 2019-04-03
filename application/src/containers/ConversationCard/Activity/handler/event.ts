/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbArticleNounText from './text/buildVerbArticleNounText';
import buildVerbNounText from './text/buildVerbNounText';

export default function ({
  activityData,
}: {
  activityData?: { [key: string]: any };
}) {
  if (activityData) {
    return buildVerbNounText({
      verb: 'item.activity.updated',
      noun: 'item.activity.event',
    });
  }
  return buildVerbArticleNounText({
    verb: 'item.activity.created',
    noun: 'item.activity.event',
  });
}
