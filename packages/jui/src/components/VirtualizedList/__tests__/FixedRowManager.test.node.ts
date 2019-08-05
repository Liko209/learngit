/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 13:11:26
 * Copyright © RingCentral. All rights reserved.
 */
import { FixedRowManager } from '../FixedRowManager';

describe('FixedRowManager', () => {
  describe('constructor()', () => {
    it('should init with minRowHeight', () => {
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager).toBeInstanceOf(FixedRowManager);
    });
  });

  describe('getEstimateRowHeight()', () => {
    it('should return minRowHeight', () => {
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.getEstimateRowHeight()).toBe(40);
    });
  });

  describe('getRowHeight()', () => {
    it('should return fixed row height', () => {
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.getRowHeight(0)).toBe(40);
      expect(rowManager.getRowHeight(1)).toBe(40);
      expect(rowManager.getRowHeight(2)).toBe(40);
    });
  });

  describe('getRowsHeight()', () => {
    let rowManager: FixedRowManager;

    beforeAll(() => {
      rowManager = new FixedRowManager({ fixedRowHeight: 40 });
    });

    describe('when computing known rows height', () => {
      it.each`
        startIndex | stopIndex | expected
        ${0}       | ${0}      | ${40}
        ${0}       | ${1}      | ${80}
        ${0}       | ${2}      | ${120}
        ${1}       | ${2}      | ${80}
        ${1}       | ${2}      | ${80}
        ${99}      | ${100}    | ${80}
      `(
        'should return $expected - getRowsHeight($startIndex, $stopIndex)',
        ({ startIndex, stopIndex, expected }) => {
          const actual = rowManager.getRowsHeight(startIndex, stopIndex);
          expect(actual).toBe(expected);
        },
      );
    });
  });

  describe('hasRowHeight()', () => {
    it('should always be true', () => {
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.hasRowHeight(0)).toBeTruthy();
      expect(rowManager.hasRowHeight(1)).toBeTruthy();
      expect(rowManager.hasRowHeight(9999)).toBeTruthy();
    });
  });

  describe('getRowOffsetTop()', () => {
    it('should return offsetTop of row', () => {
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.getRowOffsetTop(0)).toBe(0);
      expect(rowManager.getRowOffsetTop(1)).toBe(40);
      expect(rowManager.getRowOffsetTop(2)).toBe(80);
      expect(rowManager.getRowOffsetTop(3)).toBe(120);
      expect(rowManager.getRowOffsetTop(4)).toBe(160);
    });
  });

  describe('getRowIndexFromPosition()', () => {
    it('should return row index of the position', () => {
      const MAX_INDEX = 2;
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.getRowIndexFromPosition(39, MAX_INDEX)).toBe(0);
      expect(rowManager.getRowIndexFromPosition(40, MAX_INDEX)).toBe(1);
      expect(rowManager.getRowIndexFromPosition(41, MAX_INDEX)).toBe(1);
      expect(rowManager.getRowIndexFromPosition(100, MAX_INDEX)).toBe(2);
      expect(rowManager.getRowIndexFromPosition(160, MAX_INDEX)).toBe(2);
    });

    it('should get upper index', () => {
      const MAX_INDEX = 100;
      const rowManager = new FixedRowManager({ fixedRowHeight: 40 });
      expect(rowManager.getRowIndexFromPosition(40, MAX_INDEX, true)).toBe(0);
      expect(rowManager.getRowIndexFromPosition(80, MAX_INDEX, true)).toBe(1);
    });
  });
});
