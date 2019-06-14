/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-22 21:43:58
 * Copyright © RingCentral. All rights reserved.
 */
import buildVerbNounText from './text/buildVerbNounText';
import buildVerbNounUserText from './text/buildVerbNounUserText';
import buildVerbNounAdjectivesText from './text/buildVerbNounAdjectivesText';
import buildVerbNounAdjectivesUserText from './text/buildVerbNounAdjectivesUserText';
import buildVerbArticleNounText from './text/buildVerbArticleNounText';
import buildVerbNumeralsPrepositionsNounText from './text/buildVerbNumeralsPrepositionsNounText';

// function filterHTML(text: string): string {
//   const exp = /(.*?)<.*>(.*?)<\/.*>/g;
//   const result = exp.exec(text);
//   if (result && result.length >= 3) {
//     return result[2];
//   }
//   return text;
// }

export default function ({
  activity,
  activityData,
}: {
  activity: string;
  activityData?: { [key: string]: any };
}) {
  let buildText: any = buildVerbArticleNounText;
  let verb = 'created';
  let numerals = 0;
  let user = '';
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
        numerals = old_value ? value - old_value : value;
        buildText =
          value === 100
            ? buildVerbNounText
            : buildVerbNumeralsPrepositionsNounText;
        verb = 'completed';
        break;
      case 'complete_people_ids':
        const index = activity.indexOf('for ');
        user = index > 0 ? activity.slice(index + 4) : '';
        if (old_value && old_value.length > value.length) {
          buildText = user
            ? buildVerbNounAdjectivesUserText
            : buildVerbNounAdjectivesText;
          verb = 'marked';
          break;
        }
        buildText = index > 0 ? buildVerbNounUserText : buildVerbNounText;
        verb = 'completed';
        break;
    }
  }

  return buildText({
    user,
    verb,
    numerals,
    noun: 'task',
    adjective: 'incomplete',
  });
}
