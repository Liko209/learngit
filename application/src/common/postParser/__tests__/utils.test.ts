/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-28 14:34:25
 * Copyright © RingCentral. All rights reserved.
 */
import {
  isInRange,
  containsRange,
  hasIntersection,
  getComplementRanges,
  getTopLevelChildNodesFromHTML,
  getStylesObject,
} from '../utils';
import { TextRange, ParserType } from '../types';
const parserType = ParserType.KEYWORD_HIGHLIGHT;
describe('postParser utils', () => {
  describe('isInRange', () => {
    it('should return correct boolean for whether index is in range or not', () => {
      // 1, 2, 3, 4
      const range: TextRange = {
        startIndex: 1,
        length: 4,
        parserType,
      };
      expect(isInRange(0, range)).toBe(false);
      expect(isInRange(1, range)).toBe(true);
      expect(isInRange(2, range)).toBe(true);
      expect(isInRange(3, range)).toBe(true);
      expect(isInRange(4, range)).toBe(true);
      expect(isInRange(5, range)).toBe(false);
      expect(isInRange(6, range)).toBe(false);
    });
  });

  describe('containsRange', () => {
    it('should return correct boolean for whether who contains (not equal) whom or not', () => {
      // 4, 5, 6, 7, 8
      const who: TextRange = {
        startIndex: 4,
        length: 5,
        parserType: ParserType.KEYWORD_HIGHLIGHT,
      };

      // 1, 2, 3
      expect(containsRange(who, { startIndex: 1, length: 3, parserType })).toBe(
        false,
      );

      // 1, 2, 3, 4
      expect(containsRange(who, { startIndex: 1, length: 4, parserType })).toBe(
        false,
      );

      // 1, 2, 3, 4, 5
      expect(containsRange(who, { startIndex: 1, length: 5, parserType })).toBe(
        false,
      );

      // 1, 2, 3, 4, 5, 6, 7, 8
      expect(containsRange(who, { startIndex: 1, length: 8, parserType })).toBe(
        false,
      );

      // 4, 5, 6
      expect(containsRange(who, { startIndex: 4, length: 3, parserType })).toBe(
        true,
      );

      // 4, 5, 6, 7
      expect(containsRange(who, { startIndex: 4, length: 4, parserType })).toBe(
        true,
      );

      // 4, 5, 6, 7, 8
      expect(containsRange(who, { startIndex: 4, length: 5, parserType })).toBe(
        false,
      );

      // 5, 6, 7, 8
      expect(containsRange(who, { startIndex: 5, length: 4, parserType })).toBe(
        true,
      );

      // 7, 8, 9
      expect(containsRange(who, { startIndex: 7, length: 3, parserType })).toBe(
        false,
      );

      // 7, 8, 9, 10
      expect(containsRange(who, { startIndex: 7, length: 4, parserType })).toBe(
        false,
      );

      // 9, 10, 11, 12
      expect(containsRange(who, { startIndex: 9, length: 4, parserType })).toBe(
        false,
      );

      // 4
      expect(containsRange(who, { startIndex: 4, length: 1, parserType })).toBe(
        true,
      );

      // 8
      expect(containsRange(who, { startIndex: 8, length: 1, parserType })).toBe(
        true,
      );
    });
  });

  describe('hasIntersection', () => {
    it('should return correct boolean for whether range1 and range2 has intersection', () => {
      // 1, 2, 3 vs 4, 5, 6
      expect(
        hasIntersection(
          { startIndex: 1, length: 3, parserType },
          { startIndex: 4, length: 3, parserType },
        ),
      ).toBe(false);

      // 1, 2, 3 vs 3, 4, 5
      expect(
        hasIntersection(
          { startIndex: 1, length: 3, parserType },
          { startIndex: 3, length: 3, parserType },
        ),
      ).toBe(true);

      // 1, 2, 3 vs 0, 1, 2, 3
      expect(
        hasIntersection(
          { startIndex: 1, length: 3, parserType },
          { startIndex: 0, length: 4, parserType },
        ),
      ).toBe(true);

      // 1, 2, 3 vs 0, 1, 2, 3, 4
      expect(
        hasIntersection(
          { startIndex: 1, length: 3, parserType },
          { startIndex: 0, length: 5, parserType },
        ),
      ).toBe(true);

      // 1, 2, 3 vs 5, 6, 7
      expect(
        hasIntersection(
          { startIndex: 1, length: 3, parserType },
          { startIndex: 5, length: 3, parserType },
        ),
      ).toBe(false);
    });
  });

  describe('getComplementRanges', () => {
    it('should return complementRange of ranges', () => {
      const ranges = [
        {
          startIndex: 4,
          length: 3,
        },
        {
          startIndex: 9,
          length: 4,
        },
        {
          startIndex: 15,
          length: 2,
        },
      ];
      expect(getComplementRanges(ranges, 18)).toEqual([
        {
          startIndex: 0,
          length: 4,
        },
        {
          startIndex: 7,
          length: 2,
        },
        {
          startIndex: 13,
          length: 2,
        },
        {
          startIndex: 17,
          length: 1,
        },
      ]);
      expect(getComplementRanges([], 18)).toEqual([
        {
          startIndex: 0,
          length: 18,
        },
      ]);
    });
  });
});

describe('getStyleObject', () => {
  it('should get object from style string', () => {
    expect(getStylesObject('color: red; background-color: blue')).toEqual({
      color: 'red',
      backgroundColor: 'blue',
    });
  });
});

describe('getTopLevelChildNodesFromHTML', () => {
  it('should get the parsed nodes', () => {
    const nodes = getTopLevelChildNodesFromHTML(
      `<b>Build Result</b>: :negative_squared_cross_mark: Failed <b>Failed Stages</b>: E2E Automation <a href='http://jenkins.lab.rcch.ringcentral.com/job/Jupiter-Gitlab-Integration/21589/' target='_blank' rel='noreferrer'>http://jenkins.lab.rcch.ringcentral.com/job/Jupiter-Gitlab-Integration/21589/</a>ss`,
    );
    expect(nodes).toEqual([
      {
        tag: 'b',
        isTag: true,
        attrs: {},
        inner: 'Build Result',
      },
      {
        isTag: false,
        substring: ': :negative_squared_cross_mark: Failed ',
      },
      {
        tag: 'b',
        isTag: true,
        attrs: {},
        inner: 'Failed Stages',
      },
      {
        isTag: false,
        substring: ': E2E Automation ',
      },
      {
        tag: 'a',
        isTag: true,
        attrs: {
          href:
            'http://jenkins.lab.rcch.ringcentral.com/job/Jupiter-Gitlab-Integration/21589/',
          rel: 'noreferrer',
          target: '_blank',
        },
        inner:
          'http://jenkins.lab.rcch.ringcentral.com/job/Jupiter-Gitlab-Integration/21589/',
      },
      {
        isTag: false,
        substring: 'ss',
      },
    ]);
  });
});
