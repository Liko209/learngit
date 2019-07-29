import CriteriaParser from '../CriteriaParser';
type Item = {};
describe('CriteriaParser', () => {
  let criteriaParser: CriteriaParser<Item>;

  beforeEach(() => {
    criteriaParser = new CriteriaParser();
  });

  describe('orderBy()', () => {
    it('should add orderBy', () => {
      criteriaParser.orderBy('id', true);
      expect(criteriaParser.orderBys).toEqual([{ desc: true, key: 'id' }]);
    });

    it('should add multiple orderBy', () => {
      criteriaParser.orderBy('id', true);
      criteriaParser.orderBy('date', false);
      criteriaParser.orderBy('name', false);
      expect(criteriaParser.orderBys).toEqual([
        { key: 'id', desc: true },
        { key: 'date', desc: false },
        { key: 'name', desc: false },
      ]);
    });

    it('should use desc\'s default value', () => {
      criteriaParser.orderBy('id');
      expect(criteriaParser.orderBys).toEqual([{ key: 'id', desc: false }]);
    });
  });

  describe('reverse()', () => {
    it('should be desc', () => {
      criteriaParser.reverse();
      expect(criteriaParser.desc).toBeTruthy();
    });

    it('should be asc', () => {
      criteriaParser.reverse();
      criteriaParser.reverse();
      expect(criteriaParser.desc).toBeFalsy();
    });
  });

  describe('offset()', () => {
    it('should set offset to 11', () => {
      criteriaParser.offset(11);
      expect(criteriaParser.offsets).toBe(11);
    });
  });

  describe('limit()', () => {
    it('should set limit to 11', () => {
      criteriaParser.limit(1);
      expect(criteriaParser.limits).toBe(1);
    });
  });

  describe('equal()', () => {
    it('should add range when value is number', () => {
      criteriaParser.equal('id', 1, true);
      expect(criteriaParser.equals).toEqual([
        {
          ignoreCase: true,
          key: 'id',
          value: 1,
        },
      ]);
    });
    it('should not ignore case', () => {
      criteriaParser.equal('id', 1);
      expect(criteriaParser.equals).toEqual([
        {
          ignoreCase: false,
          key: 'id',
          value: 1,
        },
      ]);
    });
  });

  describe('notEqual()', () => {
    it('should add notEqual', () => {
      criteriaParser.notEqual('id', 1);
      expect(criteriaParser.notEquals).toEqual([{ key: 'id', value: 1 }]);
    });
  });

  describe('between()', () => {
    it('should add default range', () => {
      criteriaParser.between('id');
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: -Infinity,
          upper: Infinity,
          includeLower: false,
          includeUpper: false,
        },
      ]);
    });

    it('should add range', () => {
      criteriaParser.between('id', 1, 10);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: 1,
          upper: 10,
          includeLower: false,
          includeUpper: false,
        },
      ]);
    });

    it('should add includeLower range', () => {
      criteriaParser.between('id', 1, 10, true);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: 1,
          upper: 10,
          includeLower: true,
          includeUpper: false,
        },
      ]);
    });

    it('should add includeUpper range', () => {
      criteriaParser.between('id', 1, 10, false, true);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: 1,
          upper: 10,
          includeLower: false,
          includeUpper: true,
        },
      ]);
    });
  });

  describe('greaterThan()', () => {
    it('should add range', () => {
      criteriaParser.greaterThan('id', 1);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: 1,
          upper: Infinity,
          includeLower: false,
          includeUpper: false,
        },
      ]);
    });
  });

  describe('greaterThanOrEqual()', () => {
    it('should add range', () => {
      criteriaParser.greaterThanOrEqual('id', 1);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: 1,
          upper: Infinity,
          includeLower: true,
          includeUpper: false,
        },
      ]);
    });
  });

  describe('lessThan()', () => {
    it('should add range', () => {
      criteriaParser.lessThan('id', 10);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: -Infinity,
          upper: 10,
          includeLower: false,
          includeUpper: false,
        },
      ]);
    });
  });

  describe('lessThanOrEqual()', () => {
    it('should add range', () => {
      criteriaParser.lessThanOrEqual('id', 10);
      expect(criteriaParser.ranges).toEqual([
        {
          key: 'id',
          lower: -Infinity,
          upper: 10,
          includeLower: false,
          includeUpper: true,
        },
      ]);
    });
  });

  describe('anyOf()', () => {
    it('should add anyOfs', () => {
      criteriaParser.anyOf('id', [1, 2, 3], true);
      expect(criteriaParser.anyOfs).toEqual([
        { key: 'id', array: [1, 2, 3], ignoreCase: true },
      ]);
    });

    it('should use ignoreCase\'s default value', () => {
      criteriaParser.anyOf('id', [1, 2, 3]);
      expect(criteriaParser.anyOfs).toEqual([
        { key: 'id', array: [1, 2, 3], ignoreCase: false },
      ]);
    });
  });

  describe('startsWith()', () => {
    it('should add startsWith', () => {
      criteriaParser.startsWith('id', 1, true);
      expect(criteriaParser.startsWiths).toEqual([
        { key: 'id', value: 1, ignoreCase: true },
      ]);
    });

    it('should use ignoreCase\'s default value', () => {
      criteriaParser.startsWith('id', 1);
      expect(criteriaParser.startsWiths).toEqual([
        { key: 'id', value: 1, ignoreCase: false },
      ]);
    });
  });

  describe('contain()', () => {
    it('should add contain', () => {
      criteriaParser.contain('id', 1);
      expect(criteriaParser.contains).toEqual([{ key: 'id', value: 1 }]);
    });
  });

  describe('filter()', () => {
    it('should add filter', () => {
      const callback = (obj: object) => !!obj;
      criteriaParser.filter(callback);
      expect(criteriaParser.filters).toEqual([callback]);
    });
  });

  describe('or()', () => {
    it('should add parallels', () => {
      criteriaParser.or({
        criteria: [{ key: 'id', name: 'lessThan', value: 5 }],
      });
      criteriaParser.or({
        criteria: [{ key: 'id', name: 'greaterThan', value: 10 }],
      });
      expect(criteriaParser.parallels).toEqual([
        { criteria: [{ key: 'id', name: 'lessThan', value: 5 }] },
        { criteria: [{ key: 'id', name: 'greaterThan', value: 10 }] },
      ]);
    });
  });

  describe('parse()', () => {
    it('should return parsed criteria', () => {
      const result = criteriaParser.parse([
        { key: 'id', name: 'anyOf', value: [1, 2, 3] },
        { key: 'id', name: 'lessThan', value: 2 },
        { key: 'id', name: 'greaterThan', value: 5 },
      ]);
      expect(result).toEqual({
        anyOfs: [{ array: [1, 2, 3], ignoreCase: false, key: 'id' }],
        desc: false,
        equalRangeCount: 0,
        equals: [],
        filters: [],
        limits: 0,
        notEquals: [],
        offsets: 0,
        orderBys: [],
        parallels: [],
        ranges: [
          {
            includeLower: false,
            includeUpper: false,
            key: 'id',
            lower: -Infinity,
            upper: 2,
          },
          {
            includeLower: false,
            includeUpper: false,
            key: 'id',
            lower: 5,
            upper: Infinity,
          },
        ],
        startsWiths: [],
        contains: [],
      });
    });
  });
});
