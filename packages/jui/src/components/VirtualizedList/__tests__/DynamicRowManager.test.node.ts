/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-08 13:11:26
 * Copyright © RingCentral. All rights reserved.
 */
import { DynamicRowManager } from '../DynamicRowManager';

type RowInfo = {
  index: number;
  height: number;
};

function setup({
  minRowHeight = 40,
  rowInfos,
}: {
  minRowHeight?: number;
  rowInfos: RowInfo[];
}) {
  const rowManager = new DynamicRowManager({ minRowHeight });
  rowInfos.forEach(({ index, height }) =>
    rowManager.setRowHeight(index, height),
  );
  return { rowManager };
}

describe('RowManager', () => {
  describe('constructor()', () => {
    it('should init with minRowHeight', () => {
      const rowManager = new DynamicRowManager({ minRowHeight: 40 });
      expect(rowManager).toBeInstanceOf(DynamicRowManager);
    });
  });

  describe('getEstimateRowHeight()', () => {
    it('should return minRowHeight', () => {
      const rowManager = new DynamicRowManager({ minRowHeight: 40 });
      expect(rowManager.getEstimateRowHeight()).toBe(40);
    });
  });

  describe('setRowHeight()', () => {
    it('should set row height', () => {
      const rowManager = new DynamicRowManager({ minRowHeight: 40 });
      rowManager.setRowHeight(0, 50);
      expect(rowManager.getRowHeight(0)).toBe(50);
    });
  });

  describe('getRowHeight()', () => {
    it('should return row height', () => {
      const { rowManager } = setup({
        rowInfos: [
          { index: 0, height: 40 },
          { index: 1, height: 50 },
          { index: 2, height: 60 },
        ],
      });
      expect(rowManager.getRowHeight(0)).toBe(40);
      expect(rowManager.getRowHeight(1)).toBe(50);
      expect(rowManager.getRowHeight(2)).toBe(60);
    });

    it('should return minRowHeight if row height not been recorded', () => {
      const rowManager = new DynamicRowManager({ minRowHeight: 40 });
      expect(rowManager.getRowHeight(0)).toBe(40);
    });
  });

  describe('getRowsHeight()', () => {
    let rowManager: DynamicRowManager;

    beforeAll(() => {
      ({ rowManager } = setup({
        rowInfos: [
          { index: 0, height: 40 },
          { index: 1, height: 50 },
          { index: 2, height: 60 },
        ],
      }));
    });

    describe('when computing known rows height', () => {
      it.each`
        startIndex | stopIndex | expected
        ${0}       | ${0}      | ${40}
        ${0}       | ${1}      | ${90}
        ${0}       | ${2}      | ${150}
        ${1}       | ${2}      | ${110}
        ${1}       | ${2}      | ${110}
      `(
        'should return $expected - getRowsHeight($startIndex, $stopIndex)',
        ({ startIndex, stopIndex, expected }) => {
          const actual = rowManager.getRowsHeight(startIndex, stopIndex);
          expect(actual).toBe(expected);
        },
      );
    });

    describe('when computing unknown rows height', () => {
      it.each`
        startIndex | stopIndex | expected
        ${3}       | ${3}      | ${40}
        ${3}       | ${4}      | ${80}
        ${0}       | ${4}      | ${230}
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
    it('should check if the row height is a real height (not estimate)', () => {
      const { rowManager } = setup({
        rowInfos: [{ index: 0, height: 30 }],
      });
      expect(rowManager.hasRowHeight(0)).toBeTruthy();
      expect(rowManager.hasRowHeight(1)).toBeFalsy();
    });
  });

  describe('getRowOffsetTop()', () => {
    it('should return offsetTop of row', () => {
      const { rowManager } = setup({
        rowInfos: [
          { index: 0, height: 40 },
          { index: 1, height: 50 },
          { index: 2, height: 60 },
        ],
      });

      expect(rowManager.getRowOffsetTop(0)).toBe(0);
      expect(rowManager.getRowOffsetTop(1)).toBe(40);
      expect(rowManager.getRowOffsetTop(2)).toBe(90);
      expect(rowManager.getRowOffsetTop(3)).toBe(150);
      expect(rowManager.getRowOffsetTop(4)).toBe(190);
    });
  });

  describe('getRowIndexFromPosition()', () => {
    it('should return row index of the position', () => {
      const MAX_INDEX = 2;
      const { rowManager } = setup({
        rowInfos: [
          { index: 0, height: 40 },
          { index: 1, height: 50 },
          { index: 2, height: 60 },
        ],
      });

      expect(rowManager.getRowIndexFromPosition(39, MAX_INDEX)).toBe(0);
      expect(rowManager.getRowIndexFromPosition(40, MAX_INDEX)).toBe(1);
      expect(rowManager.getRowIndexFromPosition(41, MAX_INDEX)).toBe(1);
      expect(rowManager.getRowIndexFromPosition(100, MAX_INDEX)).toBe(2);
      expect(rowManager.getRowIndexFromPosition(160, MAX_INDEX)).toBe(2);
    });
  });
});
