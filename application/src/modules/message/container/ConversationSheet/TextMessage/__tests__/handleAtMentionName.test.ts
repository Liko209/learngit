/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-29 10:19:02
 * Copyright © RingCentral. All rights reserved.
 */
import { handleAtMentionName } from '../utils/handleAtMentionName';

const encodeAtMentionTags =
  '&lt;a class=&#x27;at_mention_compose&#x27; rel=&#x27;{&quot;id&quot;:123445}&#x27;&gt;@alvin&lt;/a&gt;';
const decodeAtMentionTags =
  "<button class='at_mention_compose current' id='123445'>alvin</button>";
const encodeTags = '&lt;div class=&#x27;test&#x27;&gt;alvin test&lt;/a=div&gt;';
describe('handleAtMentionName()', () => {
  it('should return decode tags if encode tags provided', () => {
    expect(
      handleAtMentionName(encodeAtMentionTags, { 123445: 'alvin' }, 123445),
    ).toBe(decodeAtMentionTags);
  });
  it('should highlight current at mention user if current user id equals to at mention id', () => {
    expect(
      handleAtMentionName(encodeAtMentionTags, { 123445: 'alvin' }, 123445),
    ).toBe(decodeAtMentionTags);
  });
  it('should return encode tags if tags is not at mention tags', () => {
    expect(handleAtMentionName(encodeTags, { 123445: 'alvin' }, 123445)).toBe(
      encodeTags,
    );
  });
});
