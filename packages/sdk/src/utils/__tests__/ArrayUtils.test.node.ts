/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-02-28 17:29:30
 * Copyright © RingCentral. All rights reserved.
 */
import { QUERY_DIRECTION } from '../../dao/constants';
import { ArrayUtils } from '../ArrayUtils';

describe('ArrayUtils', () => {
  describe('ArrayUtils', () => {
    it.each`
      originalArray                  | anchor       | result                         | direction                | limit
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${1}         | ${[2, 3, 4]}                   | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${1}         | ${[1, 2, 3]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${1}         | ${[]}                          | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${2}         | ${[3, 4, 5]}                   | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${2}         | ${[1, 2, 3]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${2}         | ${[1]}                         | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${3}         | ${[4, 5, 6]}                   | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${3}         | ${[2, 3, 4]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${3}         | ${[1, 2]}                      | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${5}         | ${[6, 7, 8]}                   | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${5}         | ${[4, 5, 6]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${5}         | ${[2, 3, 4]}                   | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${7}         | ${[8, 9]}                      | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${7}         | ${[6, 7, 8]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${7}         | ${[4, 5, 6]}                   | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${8}         | ${[9]}                         | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${8}         | ${[7, 8, 9]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${8}         | ${[5, 6, 7]}                   | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${9}         | ${[]}                          | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${9}         | ${[7, 8, 9]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${9}         | ${[6, 7, 8]}                   | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${undefined} | ${[1, 2, 3]}                   | ${QUERY_DIRECTION.NEWER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${undefined} | ${[1, 2, 3]}                   | ${QUERY_DIRECTION.BOTH}  | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${undefined} | ${[7, 8, 9]}                   | ${QUERY_DIRECTION.OLDER} | ${3}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${1}         | ${[1, 2, 3, 4]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${2}         | ${[1, 2, 3, 4]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${3}         | ${[1, 2, 3, 4]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${5}         | ${[3, 4, 5, 6]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${7}         | ${[5, 6, 7, 8]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${8}         | ${[6, 7, 8, 9]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${9}         | ${[6, 7, 8, 9]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${undefined} | ${[1, 2, 3, 4]}                | ${QUERY_DIRECTION.BOTH}  | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${0}         | ${[6, 7, 8, 9]}                | ${QUERY_DIRECTION.OLDER} | ${4}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${0}         | ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${QUERY_DIRECTION.OLDER} | ${10}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${0}         | ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${QUERY_DIRECTION.OLDER} | ${9}
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9]} | ${0}         | ${[2, 3, 4, 5, 6, 7, 8, 9]}    | ${QUERY_DIRECTION.OLDER} | ${8}
    `(
      'should slice array at $anchor, return $result, direction: $direction',
      ({ originalArray, anchor, result, direction, limit }) => {
        expect(
          ArrayUtils.sliceIdArray(originalArray, limit, anchor, direction),
        ).toEqual(result);
      },
    );
  });
});
