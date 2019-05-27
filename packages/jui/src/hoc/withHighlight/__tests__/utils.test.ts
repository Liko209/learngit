/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-04-26 10:29:30
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import {
  highlightFormatter,
  cascadingCreate,
  cascadingGet,
  getRegexpFromKeyword,
} from '../utils';
describe('highlightForamtter', () => {
  it('should format correctly non-HTML text', () => {
    expect(highlightFormatter('abc', 'tttabcttt')).toBe(
      'ttt<span class="highlight-term">abc</span>ttt',
    );
    expect(highlightFormatter('abc z', 'tttabcttzt')).toBe(
      'ttt<span class="highlight-term">abc</span>tt<span class="highlight-term">z</span>t',
    );
    expect(highlightFormatter('abc z', 'tttabczttt')).toBe(
      'ttt<span class="highlight-term">abc</span><span class="highlight-term">z</span>ttt',
    );
    expect(highlightFormatter('1', '1')).toBe(
      '<span class="highlight-term">1</span>',
    );
    expect(highlightFormatter('1', '2221abc')).toBe(
      '222<span class="highlight-term">1</span>abc',
    );
    expect(highlightFormatter('221', '2221abc')).toBe(
      '2<span class="highlight-term">221</span>abc',
    );
    expect(highlightFormatter('221 c', '2221abc')).toBe(
      '2<span class="highlight-term">221</span>ab<span class="highlight-term">c</span>',
    );
    expect(highlightFormatter('221 c', '222 1abc')).toBe(
      '222 1ab<span class="highlight-term">c</span>',
    );
  });
  it('should format correctly HTML text', () => {
    expect(highlightFormatter('abc', 't<a>ttabctt</a>t')).toBe(
      't<a>tt<span class="highlight-term">abc</span>tt</a>t',
    );
    expect(highlightFormatter('abc z', 't<a>ttabcttz</a>t')).toBe(
      't<a>tt<span class="highlight-term">abc</span>tt<span class="highlight-term">z</span></a>t',
    );
    expect(highlightFormatter('span z', '<span>span</span>')).toBe(
      '<span><span class="highlight-term">span</span></span>',
    );
    expect(highlightFormatter('span z', '<span>span z</span>')).toBe(
      '<span><span class="highlight-term">span</span> <span class="highlight-term">z</span></span>',
    );
    expect(highlightFormatter('span z', '<span>sp an z</span>')).toBe(
      '<span>sp an <span class="highlight-term">z</span></span>',
    );
    expect(highlightFormatter('span z', '<span>sp an z</span>')).toBe(
      '<span>sp an <span class="highlight-term">z</span></span>',
    );
    expect(highlightFormatter('span z', 'span<br> spanning <br> zz')).toBe(
      '<span class="highlight-term">span</span><br> <span class="highlight-term">span</span>ning <br> <span class="highlight-term">z</span><span class="highlight-term">z</span>',
    );
    expect(
      highlightFormatter('5 ww', '<a href="www.gggolegg.com">www.115.com</a>'),
    ).toBe(
      '<a href="www.gggolegg.com"><span class="highlight-term">ww</span>w.11<span class="highlight-term">5</span>.com</a>',
    );
    expect(
      highlightFormatter(
        '5 ww',
        '<a href="www.gggolegg.com">www.115.com</a> 546',
      ),
    ).toBe(
      '<a href="www.gggolegg.com"><span class="highlight-term">ww</span>w.11<span class="highlight-term">5</span>.com</a> <span class="highlight-term">5</span>46',
    );
    expect(
      highlightFormatter(
        '5',
        '<div class="jss74 jss83 sc-iomxrj csAIRQ sc-eIHaNI cOOlkC"><div data-test-automation-id="file-name" class="sc-cBdUnI cGhMVG"><span class="sc-exkUMo fyTiJZ">photo-1529946890443-82ca0ff80</span><span>d5d.jpeg</span></div></div>',
      ),
    ).toBe(
      '<div class="jss74 jss83 sc-iomxrj csAIRQ sc-eIHaNI cOOlkC"><div data-test-automation-id="file-name" class="sc-cBdUnI cGhMVG"><span class="sc-exkUMo fyTiJZ">photo-1<span class="highlight-term">5</span>29946890443-82ca0ff80</span><span>d<span class="highlight-term">5</span>d.jpeg</span></div></div>',
    );
    expect(
      highlightFormatter(
        't',
        '&lt;a href="https://service.sumologic.com/ui/index.html" target="_blank" rel="noreferrer"&gt;SearchQueryUrl&lt;/a&gt;',
      ),
    ).toBe(
      '&lt;a href="h<span class="highlight-term">t</span><span class="highlight-term">t</span>ps://service.sumologic.com/ui/index.h<span class="highlight-term">t</span>ml" <span class="highlight-term">t</span>arge<span class="highlight-term">t</span>="_blank" rel="noreferrer"&gt;SearchQueryUrl&lt;/a&gt;',
    );
    expect(
      highlightFormatter(
        'skye.wang@ringcentral.com',
        '<a href="mailto:skye.wang@ringcentral.com" target="_blank" rel="noreferrer">skye.wang@ringcentral.com</a>',
      ),
    ).toBe(
      '<a href="mailto:skye.wang@ringcentral.com" target="_blank" rel="noreferrer"><span class="highlight-term">skye</span>.<span class="highlight-term">wang</span>@<span class="highlight-term">ringcentral</span>.<span class="highlight-term">com</span></a>',
    );
  });
});

describe('highlightForamtter fix(FIJI-5862)', () => {
  it('Should value be return directly when non-string type', () => {
    const value = React.createElement('span', null, '(907) 522-0755');
    const result = highlightFormatter('907', <string>(<unknown>value));

    expect(result).toEqual(value);
  });
});

describe('cascadingGet', () => {
  it('should work', () => {
    expect(cascadingGet({ a: { b: 123 } }, 'a.b')).toEqual(123);
    expect(cascadingGet({ a: { b: 123 }, c: 2 }, 'a.b')).toEqual(123);
    expect(
      cascadingGet(
        {
          a: { b: 123 },
          c: 2,
        },
        'a.b',
      ),
    ).toEqual(123);

    expect(cascadingGet({ a: { b: { c: 123 } } }, 'a.b.c')).toEqual(123);
    expect(
      cascadingGet(
        {
          a: { b: { __somekey: 123 } },
        },
        'a.b.__somekey',
      ),
    ).toEqual(123);
    expect(cascadingGet({ a: 123 }, 'a')).toEqual(123);
  });
});

describe('cascadingCreate', () => {
  it('should work', () => {
    expect(cascadingCreate('a.b', 123)).toEqual({ a: { b: 123 } });

    expect(cascadingCreate('a.b.c', 123)).toEqual({ a: { b: { c: 123 } } });
    expect(cascadingCreate('a.b.__somekey', 123)).toEqual({
      a: { b: { __somekey: 123 } },
    });
    expect(cascadingCreate('a', 123)).toEqual({ a: 123 });
  });
});

describe('getRegexpFromKeyword', () => {
  it('should return correct terms', () => {
    expect(getRegexpFromKeyword('ddd*s@d.')).toEqual(/ddd|s|d/gi);
  });
  it('should return correct terms', () => {
    expect(getRegexpFromKeyword('ddd*s@d. ds')).toEqual(/ddd|s|d|ds/gi);
  });
  it('should return correct terms', () => {
    expect(getRegexpFromKeyword('ddd*s@d. ds 00')).toEqual(/ddd|s|d|ds|00/gi);
  });
  it('should return correct terms', () => {
    expect(getRegexpFromKeyword('ddd*s@d. ds 00 ;p')).toEqual(
      /ddd|s|d|ds|00|p/gi,
    );
  });
  it('should return correct terms', () => {
    expect(getRegexpFromKeyword('ddd*s@d. ds 00 ;p ++ ))) {{')).toEqual(
      /ddd|s|d|ds|00|p/gi,
    );
  });
});
