/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-24 15:20:10
 * Copyright © RingCentral. All rights reserved.
 */
jest.unmock('@/common/emojiHelpers/map/mapAscii');
jest.unmock('@/common/emojiHelpers/map/mapEmojiOne');
jest.unmock('@/common/emojiHelpers/map/mapUnicode');

import React from 'react';
import { postParser } from '..';
import { JuiAtMention } from 'jui/components/AtMention';
import { JuiTextWithHighlight } from 'jui/components/TextWithHighlight';
import { PhoneLink } from '@/modules/message/container/ConversationSheet/PhoneLink';
import { renderToStaticMarkup } from 'react-dom/server';
import { Emoji } from 'emoji-mart';
import { backgroundImageFn } from 'jui/pattern/Emoji';
import { EmojiTransformer } from '../parsers/EmojiTransformer';
import * as utils from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

const hostName = 'https://d2rbro28ib85bu.cloudfront.net';
const customEmoji = {
  a_bash: {
    data:
      'https://glip-vault-1.s3.amazonaws.com/web/customer_files/96005677068/bashful.gif',
  },
  a_congrats: {
    data:
      'https://glip-vault-1.s3.amazonaws.com/web/customer_files/96005824524/congrats.gif',
  },
  'google.com': {
    data:
      'https://glip-vault-1.s3.amazonaws.com/web/customer_files/96005824524/congrats.gif',
  },
};

beforeAll(() => {
  jest
    .spyOn(EmojiTransformer, 'customEmojiMap', 'get')
    .mockReturnValue(customEmoji);
  jest.spyOn(utils, 'getGlobalValue').mockImplementation(key => {
    if (key === GLOBAL_KEYS.STATIC_HTTP_SERVER) {
      return hostName;
    }
    return utils.getGlobalValue(key);
  });
});

describe('non-glipdown text', () => {
  it('should return original text if there is no actual string content', () => {
    expect(postParser(' ')).toEqual(' ');
    expect(postParser('    ')).toEqual('    ');
    expect(postParser((undefined as unknown) as string)).toEqual(undefined);
    expect(postParser((null as unknown) as string)).toEqual(null);
    expect(postParser(({} as unknown) as string)).toEqual({});
    expect(postParser((123 as unknown) as string)).toEqual(123);
  });

  describe('separate cases', () => {
    describe('url', () => {
      it('should return array with url when text contains url', () => {
        expect(
          postParser(
            'abc http://www.baidu.com www.google.com chris.zhan@ringcentral.com',
            { url: true },
          ),
        ).toEqual([
          'abc ',
          <a
            key={0}
            rel='noopener noreferrer'
            target='_blank'
            href='http://www.baidu.com'
          >
            http://www.baidu.com
          </a>,
          ' ',
          <a
            key={1}
            rel='noopener noreferrer'
            target='_blank'
            href='http://www.google.com'
          >
            www.google.com
          </a>,
          ' ',
          <a
            key={2}
            rel='noopener noreferrer'
            target='_blank'
            href='mailto:chris.zhan@ringcentral.com'
          >
            chris.zhan@ringcentral.com
          </a>,
        ]);
      });

      it('should not parse to url for string with dot if it is not valid url according to glipdown', () => {
        expect(
          postParser(
            '1.addfasddd http://www.baidu.com a.133',
            { url: true },
          ),
        ).toEqual([
          '1.addfasddd ',
          <a
            key={0}
            rel='noopener noreferrer'
            target='_blank'
            href='http://www.baidu.com'
          >
            http://www.baidu.com
          </a>,
          ' ',
          'a.133',
        ]);
      });
    });

    describe('keywords', () => {
      it('should return array with Highlight given only one keyword', () => {
        expect(postParser('abc', { keyword: 'b' })).toEqual([
          'a',
          <JuiTextWithHighlight key={0}>b</JuiTextWithHighlight>,
          'c',
        ]);

        expect(postParser('abc12c', { keyword: '12' })).toEqual([
          'abc',
          <JuiTextWithHighlight key={0}>12</JuiTextWithHighlight>,
          'c',
        ]);
      });

      it('should return array with Highlight given multiple keyword', () => {
        expect(postParser('abc', { keyword: 'b a' })).toEqual([
          <JuiTextWithHighlight key={0}>a</JuiTextWithHighlight>,
          <JuiTextWithHighlight key={1}>b</JuiTextWithHighlight>,
          'c',
        ]);
      });

      it('should return array with Highlight given complicated keyword', () => {
        expect(
          postParser('abc@123__testtestt est', { keyword: 'b a@3 test' }),
        ).toEqual([
          <JuiTextWithHighlight key={0}>a</JuiTextWithHighlight>,
          <JuiTextWithHighlight key={1}>b</JuiTextWithHighlight>,
          'c@12',
          <JuiTextWithHighlight key={2}>3</JuiTextWithHighlight>,
          '__',
          <JuiTextWithHighlight key={3}>test</JuiTextWithHighlight>,
          <JuiTextWithHighlight key={4}>test</JuiTextWithHighlight>,
          't est',
        ]);
      });

      it('Different language can be highlighted [JPT-2298]', () => {
        expect(postParser('abc我们', { keyword: '我们' })).toEqual([
          'abc',
          <JuiTextWithHighlight key={0}>我们</JuiTextWithHighlight>,
        ]);
        expect(postParser('abc我们 привет', { keyword: '我们 при' })).toEqual([
          'abc',
          <JuiTextWithHighlight key={0}>我们</JuiTextWithHighlight>,
          ' ',
          <JuiTextWithHighlight key={1}>при</JuiTextWithHighlight>,
          'вет',
        ]);
      });
    });

    describe('phone number', () => {
      it('should return array with PhoneNumberLink when number is valid - NUMBER_WITH_DASH', () => {
        expect(
          postParser(`650-740-5231`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'650-740-5231'} key={0}>
            650-740-5231
          </PhoneLink>,
        ]);
      });
      it('should return array with PhoneNumberLink when number is valid - NUMBER_WITH_SINGLE_BLANK', () => {
        expect(
          postParser(`650 741 5231`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'650 741 5231'} key={0}>
            650 741 5231
          </PhoneLink>,
        ]);
      });
      it('should return array with PhoneNumberLink when number is valid - MESSAGE_WITH_SPECIAL_CHAR', () => {
        expect(
          postParser(`+1(650)399-0766`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'+1(650)399-0766'} key={0}>
            +1(650)399-0766
          </PhoneLink>,
        ]);
      });
      it('should return array with PhoneNumberLink when number is valid - NUMBER_WITH_BRACKETS', () => {
        expect(
          postParser(`(650)741-234-3456`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'(650)741-234-3456'} key={0}>
            (650)741-234-3456
          </PhoneLink>,
        ]);
      });
      it('should return array with PhoneNumberLink when number is valid - NUMBER_IN_STRING', () => {
        expect(
          postParser(`123456789abcd`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'123456789'} key={0}>
            123456789
          </PhoneLink>,
          'abcd',
        ]);
      });
      it('should return array with PhoneNumberLink when number is valid - MESSAGE_WITH_STRING_AND_NUMBER', () => {
        expect(
          postParser(`650 740 5234  sadssdada`, {
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'650 740 5234'} key={0}>
            650 740 5234
          </PhoneLink>,
          '  sadssdada',
        ]);
      });

      it('should return orignal string as array when number is invalid - NUMBER_LESS_THAN_SEVEN', () => {
        expect(
          postParser(`123456`, {
            phoneNumber: true,
          }),
        ).toEqual(`123456`);
      });

      it('should return orignal string as array when number is invalid - MESSAGE_WITH_PLUS', () => {
        expect(
          postParser(`+123456789,asdas`, {
            phoneNumber: true,
          }),
        ).toEqual(`+123456789,asdas`);
      });

      it('should return orignal string as array when number is invalid - NUMBER_BRACKETS_WITH_LONG', () => {
        expect(
          postParser(`(650)741-1212-456789`, {
            phoneNumber: true,
          }),
        ).toEqual(`(650)741-1212-456789`);
      });

      it('should return orignal string as array when number is invalid - NUMBER_MORE_THAN_FIFTEEN', () => {
        expect(
          postParser(`1234567812345678`, {
            phoneNumber: true,
          }),
        ).toEqual(`1234567812345678`);
      });

      it('should be able to recognize multiple valid phone numbers', () => {
        expect(
          postParser(
            `+1(650)399-0766  650-740-5231  650 740 5234  sadssdada(650)741-1212-456789`,
            {
              phoneNumber: true,
            },
          ),
        ).toEqual([
          <PhoneLink text={'+1(650)399-0766'} key={0}>
            +1(650)399-0766
          </PhoneLink>,
          '  ',
          <PhoneLink text={'650-740-5231'} key={1}>
            650-740-5231
          </PhoneLink>,
          '  ',
          <PhoneLink text={'650 740 5234'} key={2}>
            650 740 5234
          </PhoneLink>,
          '  sadssdada(650)741-1212-456789',
        ]);
      });
    });
  });

  describe('coexisting cases', () => {
    describe('no conflict', () => {
      it('should return array with both Highlight and PhoneNumberLink when both exists and no conflicts and separate with blank spaces', () => {
        expect(
          postParser(`650-740-5231 abc`, {
            keyword: 'b',
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'650-740-5231'} key={0}>
            650-740-5231
          </PhoneLink>,
          ' a',
          <JuiTextWithHighlight key={1}>b</JuiTextWithHighlight>,
          'c',
        ]);
      });

      it('should return array with both Highlight and PhoneNumberLink when both exists and no conflicts and not separated', () => {
        expect(
          postParser(`+1(650)399-0766abc`, {
            keyword: 'ab',
            phoneNumber: true,
          }),
        ).toEqual([
          <PhoneLink text={'+1(650)399-0766'} key={0}>
            +1(650)399-0766
          </PhoneLink>,
          <JuiTextWithHighlight key={1}>ab</JuiTextWithHighlight>,
          'c',
        ]);
      });

      it('should return array with both Highlight and PhoneNumberLink when both exists and no conflicts and not separated', () => {
        expect(
          postParser(`  13abby+1(650)399-0766abc`, {
            keyword: 'ab',
            phoneNumber: true,
          }),
        ).toEqual([
          '  13',
          <JuiTextWithHighlight key={0}>ab</JuiTextWithHighlight>,
          'by',
          <PhoneLink text={'+1(650)399-0766'} key={1}>
            +1(650)399-0766
          </PhoneLink>,
          <JuiTextWithHighlight key={2}>ab</JuiTextWithHighlight>,
          'c',
        ]);
      });
    });

    describe('conflicting', () => {
      it('should return array with Highlight and PhoneNumberLink when there is phone number inside highlight', () => {
        expect(
          postParser(`  13abby123456789abc`, {
            keyword: 'by123456789ab',
            phoneNumber: true,
          }),
        ).toEqual([
          '  13ab',
          <JuiTextWithHighlight key={0}>
            by
            <PhoneLink text={'123456789'} key={0}>
              123456789
            </PhoneLink>
            ab
          </JuiTextWithHighlight>,
          'c',
        ]);
      });

      it('should return array with Highlight and PhoneNumberLink when there is highlight inside phone link', () => {
        expect(
          postParser(`  13abby123456789abc`, {
            keyword: '3 567',
            phoneNumber: true,
          }),
        ).toEqual([
          '  1',
          <JuiTextWithHighlight key={0}>3</JuiTextWithHighlight>,
          'abby',
          <PhoneLink text={'123456789'} key={1}>
            {[
              '12',
              <JuiTextWithHighlight key={0}>3</JuiTextWithHighlight>,
              '4',
              <JuiTextWithHighlight key={1}>567</JuiTextWithHighlight>,
              '89',
            ]}
          </PhoneLink>,
          'abc',
        ]);
      });

      it('should return array with Highlight and no PhoneNumberLink when there is phone number conflicting with highlight', () => {
        expect(
          postParser(`  13abby123456789abc`, {
            keyword: 'by12345',
            phoneNumber: true,
          }),
        ).toEqual([
          '  13ab',
          <JuiTextWithHighlight key={0}>by12345</JuiTextWithHighlight>,
          '6789abc',
        ]);

        expect(
          postParser(`  13abby123456789abc`, {
            keyword: '789abc',
            phoneNumber: true,
          }),
        ).toEqual([
          '  13abby123456',
          <JuiTextWithHighlight key={0}>789abc</JuiTextWithHighlight>,
        ]);
      });

      it('should return array with link without phone number if they conflict', () => {
        expect(
          postParser(`https://develop.fiji.gliprc.com/messages/3504234502`, {
            phoneNumber: true,
            url: true,
          }),
        ).toEqual([
          <a
            key={0}
            rel='noopener noreferrer'
            target='_blank'
            href='https://develop.fiji.gliprc.com/messages/3504234502'
          >
            https://develop.fiji.gliprc.com/messages/3504234502
          </a>,
        ]);
      });
    });
  });
});

const atmention = (id: string = '123', name: string = 'Test') =>
  `<a class='at_mention_compose' rel='{"id":${id}}'>@${name}</a>`;
const map = {
  121: {
    name: 'Admin',
    isCurrent: true,
  },
  122: {
    name: ':joy:',
  },
  123: {
    name: 'Test',
    isCurrent: false,
  },
};
describe('glipdown text', () => {
  describe('separate cases', () => {
    describe('at mentions', () => {
      it('should return array with only AtMention', () => {
        expect(postParser(atmention(), { atMentions: { map } })).toEqual([
          <JuiAtMention key={0} id='123' isCurrent={false} name='Test' />,
        ]);
        expect(
          postParser(atmention('121', 'Admin'), {
            atMentions: { map },
          }),
        ).toEqual([<JuiAtMention key={0} id='121' isCurrent name='Admin' />]);
      });

      it('should return array with AtMention - with extra string', () => {
        expect(
          postParser(`sdds${atmention()}123  ss`, {
            atMentions: { map },
          }),
        ).toEqual([
          'sdds',
          <JuiAtMention key={0} id='123' isCurrent={false} name='Test' />,
          '123  ss',
        ]);
      });

      it('should unescape mention name', () => {
        expect(
          postParser(`${atmention('999', '&amp;')}`, {
            atMentions: { map },
          }),
        ).toEqual([
          <JuiAtMention key={0} id='999' isCurrent={false} name='&' />,
        ]);

        expect(
          postParser(`${atmention('998', 'team &#x2F;&amp;&#x2F; name &amp;&#x2F;')}`, {
            atMentions: { map },
          }),
        ).toEqual([
          <JuiAtMention key={0} id='998' isCurrent={false} name='team /&/ name &/' />,
        ]);
      })
    });
    describe('emojis', () => {
      it('should parse emoji one with special character', () => {
        expect(
          postParser(':+1: :-1:', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual('👍 👎');
      });

      it('should return array with only unicode emoji', () => {
        expect(
          postParser('😁', {
            emoji: {
              unicodeOnly: true,
            },
          }),
        ).toEqual('😁');
        expect(
          postParser(':-/', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual('😕');
        expect(
          postParser(':a_bash:', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual(':a_bash:');
        expect(
          postParser(':a_bash:', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual(':a_bash:');
        expect(
          postParser(':joy:', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual('😂');
      });

      it('should return unicode emoji even after the same emoji transformation for non-unicode is cached [BUG-FIJI-7086]', () => {
        expect(
          postParser(':joy:hahahah', {
            emoji: { unicodeOnly: false },
          }),
        ).toEqual([
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
          'hahahah',
        ]);

        expect(
          postParser(':joy:hahahah', {
            emoji: { unicodeOnly: true },
          }),
        ).toEqual('😂hahahah');
      });

      it('should return woman NOT family when enter :woman:', ()=> {
        expect(postParser(':woman:', {
          emoji: {},
        }),).toEqual([
          <Emoji
            emoji='woman'
            skin={1}
            set={'emojione'}
            size={30}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            👩
          </Emoji>
        ])
      })


      it('should return array with only image emoji only[JPT-2387, JPT-2392, JPT-2396]', () => {
        expect(postParser('😁', { emoji: {} })).toEqual([
          <Emoji
            emoji='grin'
            skin={1}
            set={'emojione'}
            size={30}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😁
          </Emoji>,
        ]);
        expect(postParser(':-/', { emoji: {} })).toEqual([
          <Emoji
            emoji='confused'
            skin={1}
            set={'emojione'}
            size={30}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😕
          </Emoji>,
        ]);
        expect(
          postParser(':a_bash:', {
            emoji: {},
          }),
        ).toEqual([
          <img
            className='emoji enlarge-emoji'
            alt='emoji'
            src={customEmoji['a_bash'].data}
            key={0}
          />,
        ]);
        expect(
          postParser(':joy:', {
            emoji: {},
          }),
        ).toEqual([
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={30}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
        ]);
        expect(
          postParser(':thinking_face::purse::shallow_pan_of_food:', {
            emoji: {},
          }),
        ).toEqual([
          <Emoji
            emoji='thinking_face'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            🤔
          </Emoji>,
          <Emoji
            emoji='purse'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            👛
          </Emoji>,
          <Emoji
            emoji='shallow_pan_of_food'
            skin={1}
            set={'emojione'}
            size={20}
            key={2}
            backgroundImageFn={backgroundImageFn}
          >
            🥘
          </Emoji>,
        ]);
      });

      it('should parse multiple ascii emojis[JPT-2396, JPT-2387]', () => {
        expect(postParser(':-/ -_- <3', { emoji: {} })).toEqual([
          <Emoji
            emoji='confused'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😕
          </Emoji>,
          ' ',
          <Emoji
            emoji='expressionless'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            😑
          </Emoji>,
          ' ',
          <Emoji
            emoji='heart'
            skin={1}
            set={'emojione'}
            size={20}
            key={2}
            backgroundImageFn={backgroundImageFn}
          >
            ❤
          </Emoji>,
        ]);

        expect(postParser('-_- -_- -_-', { emoji: {} })).toEqual([
          <Emoji
            emoji='expressionless'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😑
          </Emoji>,
          ' ',
          <Emoji
            emoji='expressionless'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            😑
          </Emoji>,
          ' ',
          <Emoji
            emoji='expressionless'
            skin={1}
            set={'emojione'}
            size={20}
            key={2}
            backgroundImageFn={backgroundImageFn}
          >
            😑
          </Emoji>,
        ]);
      });

      it("should not parse ascii emoji when it's part of words", () => {
        expect(postParser(`ID: 123`, { emoji: {}, html: true })).toEqual(
          'ID: 123',
        );
        expect(
          postParser(`app:///webpack:/src/main/main.ts`, {
            emoji: {},
            html: true,
          }),
        ).toEqual('app:///webpack:/src/main/main.ts');
      });

      it('should return array with image emoji and other text[JPT-2392, JPT-2396]', () => {
        expect(
          postParser(`hahah😁123___🏳️‍🌈++ ':( :joy:`, {
            emoji: {},
          }),
        ).toEqual([
          'hahah',
          <Emoji
            emoji='grin'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😁
          </Emoji>,
          '123___',
          <img
            alt='🏳🌈'
            className='emoji'
            src='https://d2rbro28ib85bu.cloudfront.net/emoji/emojione/png/1f3f3-1f308.png?v=2.2.7'
            title='🏳️‍🌈'
            key={1}
          />,
          '++ ',
          <Emoji
            emoji='sweat'
            skin={1}
            set={'emojione'}
            size={20}
            key={2}
            backgroundImageFn={backgroundImageFn}
          >
            😓
          </Emoji>,
          ' ',
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={20}
            key={3}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
        ]);
      });

      it('should return array with emoji when html parser escape the ascii', () => {
        expect(
          postParser(`<3 ':)`, {
            html: true,
            emoji: {},
          }),
        ).toEqual([
          <Emoji
            emoji='heart'
            skin={1}
            set={'emojione'}
            size={20}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            ❤
          </Emoji>,
          ' ',
          <Emoji
            emoji='sweat_smile'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            😅
          </Emoji>,
        ]);
      });

      it('should parse :D as emoji', () => {
        expect(
          postParser(`:D`, {
            html: true,
            emoji: {},
          }),
        ).toEqual([
          <Emoji
            emoji='smiley'
            skin={1}
            set={'emojione'}
            size={30}
            key={0}
            backgroundImageFn={backgroundImageFn}
          >
            😃
          </Emoji>,
        ]);
      })
    });

    describe('html', () => {
      it('should parse markdown by default', () => {
        expect(postParser(`**bold**`, { html: true })).toEqual([
          <b key={0}>bold</b>,
        ]);
        expect(
          postParser(
            `**bold**https://www.youtube.com/watch?v=3ZiibOdm-1Y [code]https://www.youtube.com/watch?v=3ZiibOdm-1Y[/code]`,
            {
              html: true,
            },
          ),
        ).toEqual([
          <b key={0}>bold</b>,
          <a
            href='https://www.youtube.com/watch?v=3ZiibOdm-1Y'
            rel='noreferrer'
            target='_blank'
            key={1}
          >
            https://www.youtube.com/watch?v=3ZiibOdm-1Y
          </a>,
          ' ',
          <pre className='codesnippet' key={2}>
            https://www.youtube.com/watch?v=3ZiibOdm-1Y
          </pre>,
        ]);
        expect(
          postParser(`* awesome`, {
            html: true,
          }),
        ).toEqual([<ul key={0}>{[<li key={0}>awesome</li>]}</ul>]);

        expect(
          postParser(
            `[code][some link](http://heynow.com)[/code][legit](http://legit.com)`,
            { html: true },
          ),
        ).toEqual([
          <pre className='codesnippet' key={0}>
            &lt;a href='http://heynow.com' target='_blank'
            rel='noreferrer'&gt;some link&lt;/a&gt;
          </pre>,
          <a href='http://legit.com' target='_blank' rel='noreferrer' key={1}>
            legit
          </a>,
        ]);
      });

      it('should parse quote when there is line break character in quote', () => {
        expect(
          postParser(
            `<a class='at_mention_compose' rel='{"id":12332}'>@Steve</a> wrote:
> Est laborum sit nulla sint deserunt cillum et cillum.
> Veniam anim velit amet aliqua proident.

Anim velit nostrud ea ipsum eu deserunt voluptate non culpa sint minim labore.`,
            { html: true, atMentions: { map } },
          ),
        ).toEqual([
          <JuiAtMention id='12332' isCurrent={false} name='Steve' key={0} />,
          ' wrote:',
          <q key={1}>
            {`Est laborum sit nulla sint deserunt cillum et cillum.
Veniam anim velit amet aliqua proident.`}
          </q>,
          '\nAnim velit nostrud ea ipsum eu deserunt voluptate non culpa sint minim labore.',
        ]);
      });

      it('should parse markdown table correctly', () => {
        expect(
          renderToStaticMarkup(postParser(
            `| **Account**| dan@close.com |
| **From** | Dave Varenos |`,
            { html: true },
          ) as React.ReactElement),
        ).toEqual(
          `<table><tr valign="top"><td width="50%"> <b>Account</b></td><td width="50%"> <a href="mailto:dan@close.com" target="_blank" rel="noreferrer">dan@close.com</a> </td></tr><tr valign="top"><td width="50%"> <b>From</b> </td><td width="50%"> Dave Varenos </td></tr></table>`,
        );
      });

      it('should not encode or decode html entity', () => {
        expect(postParser(`aww<.*//`, { html: true })).toEqual(`aww<.*//`);
        expect(postParser(`<a>dsfdsf</a>`, { html: true })).toEqual(
          `<a>dsfdsf</a>`,
        );
        expect(postParser(`&lt;a&gt;dsfdsf&lt;/a&gt;`, { html: true })).toEqual(
          `&lt;a&gt;dsfdsf&lt;/a&gt;`,
        );
      });

      it('should not encode special chars at the end of link', () => {
        expect(postParser(`"https://jira.ringcentral.com/browse/FIJI-7628"`, { html: true })).toEqual([
          '"',
          <a href='https://jira.ringcentral.com/browse/FIJI-7628"' target='_blank' rel='noreferrer' key={0}>
            https://jira.ringcentral.com/browse/FIJI-7628"
          </a>,
          ';',
        ])
        expect(postParser(`'https://jira.ringcentral.com/browse/FIJI-7628'`, { html: true })).toEqual([
          "'",
          <a href="https://jira.ringcentral.com/browse/FIJI-7628'" target='_blank' rel='noreferrer' key={0}>
            https://jira.ringcentral.com/browse/FIJI-7628'
          </a>,
          ';',
        ])
      })
    });
  });

  describe('conflict cases', () => {
    describe('at mention and emoji', () => {
      it('should render both atmention and emoji', () => {
        expect(
          postParser(
            `<a class='at_mention_compose' rel='{"id":187817987}'>@Jesse</a> :joy:`,
            {
              atMentions: { map },
              emoji: {},
              html: true,
            },
          ),
        ).toEqual([
          <JuiAtMention
            key={0}
            id='187817987'
            isCurrent={false}
            name='Jesse'
          />,
          ' ',
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
        ]);
      });

      it('should render both quote and emoji', () => {
        expect(
          postParser(
            `<a class='at_mention_compose' rel='{"id":187817987}'>@Jesse</a> wrote:
> sdfsadf
:joy:`,
            {
              atMentions: { map },
              emoji: {},
              html: true,
            },
          ),
        ).toEqual([
          <JuiAtMention
            id='187817987'
            isCurrent={false}
            name='Jesse'
            key={0}
          />,
          ' wrote:',
          <q key={1}>sdfsadf</q>,
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={20}
            key={2}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
        ]);
      });

      it('should only render at mention when there is emoji in at mention', () => {
        expect(
          postParser(`sdds${atmention('122', ':joy:')}123  ss`, {
            atMentions: { map },
            emoji: {},
          }),
        ).toEqual([
          'sdds',
          <JuiAtMention key={0} id='122' isCurrent={false} name=':joy:' />,
          '123  ss',
        ]);
      });

      it('should only render at mention when there is unicode emoji in at mention', () => {
        expect(
          postParser(`sdds${atmention('12244', '🤣')}123  ss`, {
            atMentions: { map },
            emoji: {},
          }),
        ).toEqual([
          'sdds',
          <JuiAtMention key={0} id='12244' isCurrent={false} name='🤣' />,
          '123  ss',
        ]);
      });
    });

    describe('html and at mention and url', () => {
      it('should only render at mention when there is url in at mention', () => {
        expect(
          postParser(`sdds${atmention('122334', 'www.baidu.com')}123  ss`, {
            atMentions: { map },
            html: true,
          }),
        ).toEqual([
          'sdds',
          <JuiAtMention
            key={0}
            id='122334'
            isCurrent={false}
            name='www.baidu.com'
          />,
          '123  ss',
        ]);
      });

      it('should render at mentions', () => {
        expect(
          postParser(
            `https://git.ringcentral.com/Fiji/Fiji/merge_requests/2838/diffs  feat(fiji-6318): [UI] Refactor call store <a class='at_mention_compose' rel='{"id":187629571}'>@Chris Zhan</a> <a class='at_mention_compose' rel='{"id":187678723}'>@Shining Miao</a>   please help review`,
            {
              atMentions: { map },
              html: true,
            },
          ),
        ).toEqual([
          <a
            href='https://git.ringcentral.com/Fiji/Fiji/merge_requests/2838/diffs'
            rel='noreferrer'
            target='_blank'
            key={0}
          >
            https://git.ringcentral.com/Fiji/Fiji/merge_requests/2838/diffs
          </a>,
          '  feat(fiji-6318): [UI] Refactor call store ',
          <JuiAtMention
            id='187629571'
            isCurrent={false}
            name='Chris Zhan'
            key={1}
          />,
          ' ',
          <JuiAtMention
            id='187678723'
            isCurrent={false}
            name='Shining Miao'
            key={2}
          />,
          '   please help review',
        ]);
      });
    });

    describe('html and atmention', () => {
      it('should only render at mention when at mention contains html', () => {
        expect(
          postParser(`sdds${atmention('1200', '**bold**')}123  ss`, {
            html: true,
            atMentions: { map },
          }),
        ).toEqual([
          'sdds',
          <JuiAtMention key={0} id='1200' isCurrent={false} name='**bold**' />,
          '123  ss',
        ]);
      });

      it('should render at mention when html contains at mention', () => {
        expect(
          postParser(`*sdds${atmention('123', 'Test')}123*  ss`, {
            html: true,
            atMentions: { map },
          }),
        ).toEqual([
          <i key={0}>
            sdds
            <JuiAtMention key={0} id='123' isCurrent={false} name='Test' />
            123
          </i>,
          '  ss',
        ]);
      });

      it('should not parse html tags when has at mention', () => {
        expect(
          postParser(
            `<user name> test <password> ${atmention(
              '123233',
              'Aaliyah Lind',
            )}`,
            { html: true, atMentions: { map } },
          ),
        ).toEqual([
          '<user name> test <password> ',
          <JuiAtMention
            key={0}
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
          />,
        ]);

        expect(
          postParser(`${atmention('123233', 'Aaliyah Lind')} </a>`, {
            html: true,
            atMentions: { map },
          }),
        ).toEqual([
          <JuiAtMention
            key={0}
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
          />,
          ' </a>',
        ]);

        expect(
          postParser(`${atmention('123233', 'Aaliyah Lind')}<a></a>`, {
            html: true,
            atMentions: { map },
          }),
        ).toEqual([
          <JuiAtMention
            key={0}
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
          />,
          '<a></a>',
        ]);
      });

      it('should be able to render multiple at mentions', () => {
        expect(
          postParser(
            `${atmention('123233', 'Aaliyah Lind')}${atmention(
              '123233',
              'Aaliyah Lind',
            )}`,
            {
              html: true,
              atMentions: { map },
            },
          ),
        ).toEqual([
          <JuiAtMention
            key={0}
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
          />,
          <JuiAtMention
            key={1}
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
          />,
        ]);
      });

      it('should parse atmention correctly when there is no space between atmention and url', () => {
        expect(
          postParser(
            `https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790${atmention(
              '123233',
              'Aaliyah Lind',
            )}`,
            { atMentions: { map }, html: true },
          ),
        ).toEqual([
          <a
            href='https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790'
            rel='noreferrer'
            target='_blank'
            key={0}
          >
            https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790
          </a>,
          <JuiAtMention
            id='123233'
            isCurrent={false}
            name='Aaliyah Lind'
            key={1}
          />,
        ]);
      });
    });

    describe('html and emoji', () => {
      it('should render emoji when html contains emoji', () => {
        expect(
          postParser(`[code][some link](http://heynow.com):joy:[/code]`, {
            html: true,
            emoji: {},
          }),
        ).toEqual([
          <pre className='codesnippet' key={0}>
            &lt;a href='http://heynow.com' target='_blank'
            rel='noreferrer'&gt;some link&lt;/a&gt;
            <Emoji
              emoji='joy'
              skin={1}
              set={'emojione'}
              size={20}
              key={0}
              backgroundImageFn={backgroundImageFn}
            >
              😂
            </Emoji>
          </pre>,
        ]);
      });

      it('should render at mention when at mention and html conflicts', () => {
        expect(
          postParser(`*sdds**${atmention('12993', 'SS')}123*  google.com`, {
            html: true,
            atMentions: { map },
          }),
        ).toEqual([
          <i key={0}>sdds</i>,
          <i key={1}>
            <JuiAtMention key={0} id='12993' isCurrent={false} name='SS' />
            123
          </i>,
          '  ',
          <a key={2} href='http://google.com' rel='noreferrer' target='_blank'>
            google.com
          </a>,
        ]);
      });

      it('should parse emoji correctly when there is no space between emoji and url', () => {
        expect(
          postParser(
            `https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790:joy:`,
            { emoji: {}, html: true },
          ),
        ).toEqual([
          <a
            href='https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790'
            rel='noreferrer'
            target='_blank'
            key={0}
          >
            https://mr-bug-fiji-6728.fiji.gliprc.com/messages/42614790
          </a>,
          <Emoji
            emoji='joy'
            skin={1}
            set={'emojione'}
            size={20}
            key={1}
            backgroundImageFn={backgroundImageFn}
          >
            😂
          </Emoji>,
        ]);
      });

      it('should parse correctly when quote an emoji', () => {
        expect(
          renderToStaticMarkup(postParser('> :joy:', {
            emoji: {},
            html: true,
          }) as any),
        ).toMatch(
          /<q><span aria-label="😂, joy" class="emoji-mart-emoji"><span style="[\s\S]+">😂<\/span><\/span><\/q>/,
        );
      });
    });

    describe('html and highlight', () => {
      it('should highlight email', () => {
        expect(
          postParser(`skye.wang@ringcentral.com`, {
            html: true,
            keyword: 'skye.wang@ringcentral.com',
          }),
        ).toEqual([
          <a
            href='mailto:skye.wang@ringcentral.com'
            target='_blank'
            rel='noreferrer'
            key={0}
          >
            <JuiTextWithHighlight key={0}>skye</JuiTextWithHighlight>.
            <JuiTextWithHighlight key={1}>wang</JuiTextWithHighlight>@
            <JuiTextWithHighlight key={2}>ringcentral</JuiTextWithHighlight>.
            <JuiTextWithHighlight key={3}>com</JuiTextWithHighlight>
          </a>,
        ]);
      });
      it('should highlight link in code', () => {
        expect(
          postParser(`[code][some link ttt](www.google.com)[/code]`, {
            html: true,
            keyword: 't',
          }),
        ).toEqual([
          <pre className='codesnippet' key={0}>
            {[
              `<a href='www.google.com' `,
              <JuiTextWithHighlight key={0}>t</JuiTextWithHighlight>,
              `arge`,
              <JuiTextWithHighlight key={1}>t</JuiTextWithHighlight>,
              `='_blank' rel='noreferrer'>some link `,
              <JuiTextWithHighlight key={2}>t</JuiTextWithHighlight>,
              <JuiTextWithHighlight key={3}>t</JuiTextWithHighlight>,
              <JuiTextWithHighlight key={4}>t</JuiTextWithHighlight>,
              `</a>`,
            ]}
          </pre>,
        ]);
      });
    });

    describe('html and phone', () => {
      it('should not parse to phone number link when phone number in url', () => {
        expect(
          postParser(`www.sina.com/6503990009`, {
            html: true,
            phoneNumber: true,
          }),
        ).toEqual([
          <a
            href='http://www.sina.com/6503990009'
            target='_blank'
            rel='noreferrer'
            key={0}
          >
            www.sina.com/6503990009
          </a>,
        ]);
      });
    });
  });
});
