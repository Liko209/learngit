/*
 * @Author: Paynter Chen
 * @Date: 2019-08-03 13:10:04
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import { update, UpdateSpec } from '../update';

describe('test update', () => {
  describe('update directly as deep partial update', () => {
    it('update array partially at root 1', () => {
      const source = {
        x: [1, 2, 3],
        y: 11,
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: [22],
        y: undefined,
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: [22, 2, 3],
        y: 11,
      });
    });
    it('update array partially at root 1', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, [4, 5, 6, 7]);
      expect(source).toEqual(copy);
      expect(result).toEqual([4, 5, 6, 7]);
    });
    it('update array partially at root 2', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, [, 4]);
      expect(source).toEqual(copy);
      expect(result).toEqual([1, 4, 3]);
    });
    it('update array partially at root 3(not same as $set)', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, [2]);
      expect(source).toEqual(copy);
      expect(result).toEqual([2, 2, 3]);
    });
    it('push at deep', () => {
      const source = {
        x: [1],
        y: {
          z: [1],
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: { $push: [2, 3] },
        y: {
          $set: { z: [1, 2, 3] },
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: [1, 2, 3],
        y: { z: [1, 2, 3] },
      });
    });
    it('update array in deep', () => {
      const source = {
        x: {
          y: [
            {
              z: {
                a: 111,
                b: 111,
              },
              a: 111,
            },
          ],
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: {
          y: [
            {
              z: {
                a: 222,
              },
            },
            {
              z: {
                a: 222,
              },
            },
          ],
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: {
          y: [
            {
              z: {
                a: 222,
                b: 111,
              },
              a: 111,
            },
            {
              z: {
                a: 222,
              },
            },
          ],
        },
      });
    });
    it('update object partially at root', () => {
      const source = {
        x: 11,
        y: {
          z: 'dddd',
          a: 11,
        },
        z: {
          a: 11,
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: 22,
        y: {
          z: 'ffff',
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: 22,
        y: {
          z: 'ffff',
          a: 11,
        },
        z: {
          a: 11,
        },
      });
    });
  });
  describe('$set', () => {
    it('set object at root', () => {
      const source = {
        x: 1233,
        y: {
          z: 'ssss',
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $set: {
          x: 33333,
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: 33333,
      });
    });
    it('set array in deep', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, [, { $set: 555 }]);
      expect(source).toEqual(copy);
      expect(result).toEqual([1, 555, 3]);
    });
    it('set object in deep', () => {
      const source = {
        y: { z: 111 },
        b: { c: { v: 111 } },
      } as object;
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: { y: 222 },
        y: { z: 222, m: 222 },
        z: { a: { $set: { v: 222 } } },
        a: { b: { $apply: v => ({ v: 222 }) } },
        b: { c: { $apply: v => (v ? v : { v: 222 }) } },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: { y: 222 },
        y: { z: 222, m: 222 },
        z: { a: { v: 222 } },
        a: { b: { v: 222 } },
        b: { c: { v: 111 } },
      });
    });
  });
  describe('$delete', () => {
    it('delete object key at root', () => {
      const source = {
        x: 'sss',
        y: 'gdsdg',
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $delete: 'x',
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({ y: source.y });
    });
    it('delete object key in deep', () => {
      const source = {
        x: 'sss',
        y: {
          z: 'ffff',
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        y: {
          $delete: 'z',
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: 'sss',
        y: {
          // z: 'ffff'
        },
      });
    });
    it('delete array at root', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $delete: 1,
      });
      expect(source).toEqual(copy);
      expect(result).toEqual([1, 3]);
    });
    it('delete array in deep', () => {
      const source = {
        x: [1, 2, 3],
        y: { z: [1, 2, 3] },
        z: [1, 2, 3],
        a: [1, 2, 3],
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: { $delete: 1 },
        y: { z: { $delete: 2 } },
        z: { $delete: 4 },
        a: { $delete: 0 },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: [1, 3],
        y: { z: [1, 2] },
        z: [1, 2, 3],
        a: [2, 3],
      });
    });
  });

  describe('$splice', () => {
    it('splice array at root', () => {
      const source = [1, 2, 3];
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $splice: [1, 1, [333]],
      });
      expect(source).toEqual(copy);
      expect(result).toEqual([1, 333, 3]);
    });
    it('splice array in deep', () => {
      const source = {
        x: {
          y: [1, 2, 3],
          z: 111,
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: {
          y: {
            $splice: [1, 1, [333]],
          },
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: {
          y: [1, 333, 3],
          z: 111,
        },
      });
    });
  });

  describe('$apply', () => {
    it('apply at root', () => {
      const source = [1];
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $apply: v => [2, 3],
      });
      expect(source).toEqual(copy);
      expect(result).toEqual([2, 3]);
    });
    it('apply in deep apply', () => {
      const source = {
        x: 1233,
        y: {
          z: 'ssss',
        },
        a: [23232],
        b: [
          {
            dd: 33,
          },
          {
            d2d: 33,
          },
        ],
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: {
          $apply: v => v + 1,
        },
        y: {
          z: {
            $apply: v => `apply(${v})`,
          },
        },
      });

      expect(source).toEqual(copy);
      expect(result).toEqual({
        ...source,
        x: source.x + 1,
        y: {
          z: `apply(${source.y.z})`,
        },
      });
    });
  });
  describe('$push', () => {
    it('push at root', () => {
      const source = [1];
      const copy = _.cloneDeep(source);
      const result = update(source, {
        $push: [2, 3],
      });
      expect(source).toEqual(copy);
      expect(result).toEqual([1, 2, 3]);
    });
    it('push at deep', () => {
      const source = {
        x: [1],
        y: {
          z: [1],
        },
      };
      const copy = _.cloneDeep(source);
      const result = update(source, {
        x: { $push: [2, 3] },
        y: { z: { $push: [2, 3] } },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        x: [1, 2, 3],
        y: { z: [1, 2, 3] },
      });
    });
  });

  describe('compose', () => {
    it('push at deep', () => {
      type Req<T> = {
        data: T;
      };
      type Res<T> = {
        data: T;
        status: number;
      };
      type RequestResponse<Req, Res> = {
        headers: {
          auth: string;
        };
        request: Req;
        response: Res;
      };
      const source: RequestResponse<
        Req<{ id: number; name: string }>,
        Res<{ id: number }>
      > = {
        headers: {
          auth: 'abc',
        },
        request: {
          data: {
            id: 123,
            name: 'abc',
          },
        },
        response: {
          data: {
            id: 123,
          },
          status: 400,
        },
      };
      const copy = _.cloneDeep(source);
      const updateReqRes = <Req, Res>(
        d: RequestResponse<Req, Res>,
        spec: { request: UpdateSpec<Req>; response: UpdateSpec<Res> },
      ) => {
        return update(d, {
          headers: {
            auth: 'abc',
          },
          request: spec.request,
          response: spec.response,
        });
      };
      const result = updateReqRes(source, {
        request: {
          data: {
            id: 222,
          },
        },
        response: {
          data: {
            id: 222,
          },
          status: 200,
        },
      });
      expect(source).toEqual(copy);
      expect(result).toEqual({
        headers: {
          auth: 'abc',
        },
        request: {
          data: {
            id: 222,
            name: 'abc',
          },
        },
        response: {
          data: {
            id: 222,
          },
          status: 200,
        },
      });
    });
  });
});
