/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 18:53:26
 * Copyright © RingCentral. All rights reserved.
 */
import { RelationMap } from '../RelationMap';

describe('RelationMap', () => {
  describe('add()', () => {
    it('should add the relation into map', () => {
      const relations = new RelationMap<string, number>();
      relations.add('A', 0);
      relations.add('A', 1);
      relations.add('A', 2);
      relations.add('B', 3);
      expect(relations.get('A')).toEqual([0, 1, 2]);
      expect(relations.get('B')).toEqual([3]);
    });
  });

  describe('clear()', () => {
    it('should clear all', () => {
      const relations = new RelationMap<string, number>();
      relations.add('A', 1);
      relations.add('A', 2);
      relations.add('B', 3);
      relations.clear();
      expect(relations.get('A')).toHaveLength(0);
    });
  });
});
