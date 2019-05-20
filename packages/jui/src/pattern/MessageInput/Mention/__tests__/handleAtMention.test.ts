import { UN_ESCAPE_HTML_AT_MENTION_REGEXP, decode, handleAtMention, atMentionTemplate } from '../handleAtMention';

describe('RegExp UN_ESCAPE_HTML_AT_MENTION_REGEXP', () => {
  it('at-mention', () => {
    const mentionTagOne = `<a class="at_mention_compose other class name" rel='{"id": 614403}'>@User One</a>`;
    const mentionTagTwo = `<a class='at_mention_compose other class name' rel='{"id": 614403}'>@User One</a>`;
    const otherATag = `<a rel='{"id": 614403}'>@Invalid</a>`;
    const richText = `
      dkdkdkadfoajlkadlkf
      ${mentionTagOne}
      dkdkdkadfoajlkadlkfdkdkdkadfoajlkadlkf
      ${mentionTagTwo}
      dkdkdkadfoajlkadlkfdkdkdkadfoajlkadlkf
      ${otherATag}
    `;
    const decodeString = decode(richText);
    const matches = decodeString.match(UN_ESCAPE_HTML_AT_MENTION_REGEXP);
    expect(matches).toHaveLength(2);
    expect(matches && matches[0]).toBe(decode(mentionTagOne));
    expect(matches && matches[1]).toBe(decode(mentionTagTwo));
  });
});
describe('handleAtMention', () => {
  it('rich text format - <br />', () => {
    const richText = `
      dkdkdkadfoajlkadlkf
      dkdkdkadfoajlkadlkfdkdkdkad
      dkdkdkadfoajlkadlkfdkdkdkadfoajlkadlkf
    `;
    expect(richText.match(/\n/g)).toHaveLength(4);
    const decodeString = handleAtMention(richText);
    expect(decodeString.match(/\n/g)).toBeNull();
    expect(decodeString.match(/<br \/>/g)).toHaveLength(4);
  });
  it('rich text format - mention', () => {
    const userId = '6144403';
    const userName = 'User One';
    const mentionTagOne = `<a class="at_mention_compose other class name" rel='{"id": ${userId}}'>@${userName}</a>`;
    const otherATag = `<a rel='{"id": 614403}'>@Invalid</a>`;
    const richText = `
      dkdkdkadfoajlkadlkf
      ${mentionTagOne}
      dkdkdkadfoajlkadlkfdkdkdkadfoajlkadlkf
      ${otherATag}
    `;
    const decodeString = handleAtMention(richText);
    const mentionTag = atMentionTemplate(userId, userName);
    expect(decodeString.match(mentionTag)).toHaveLength(1);
  });
});
