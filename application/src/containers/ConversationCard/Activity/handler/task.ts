/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbNounText from './text/buildVerbNounText';
import buildVerbNounAdjectivesText from './text/buildVerbNounAdjectivesText';
import buildVerbArticleNounText from './text/buildVerbArticleNounText';
import buildVerbNumeralsText from './text/buildVerbNumeralsText';

export default function ({
  activityData,
}: {
  activityData?: { [key: string]: any };
}) {
  let buildText: any = buildVerbArticleNounText;
  let verb = 'created';
  let numerals = 0;
  if (activityData) {
    const { key, value, old_value } = activityData;
    switch (key) {
      case 'assigned_to_ids':
        buildText = buildVerbNounText;
        verb = old_value.length ? 'reassigned' : 'assigned';
        break;
      case 'complete_boolean':
        buildText = value ? buildVerbNounText : buildVerbNounAdjectivesText;
        verb = value ? 'completed' : 'marked';
        break;
      case 'complete_percentage':
        buildText = value === 100 ? buildVerbNounText : buildVerbNumeralsText;
        numerals = value;
        verb = 'completed';
        break;
      case 'complete_people_ids':
        if (old_value && old_value.length > value.length) {
          buildText = buildVerbNounAdjectivesText;
          verb = 'marked';
          break;
        }
        buildText = buildVerbNounText;
        verb = 'completed';
        break;
    }
  }

  return buildText({
    verb,
    numerals,
    noun: 'task',
    adjectives: 'incomplete',
  });
}
