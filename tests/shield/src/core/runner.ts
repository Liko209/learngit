/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-22 14:05:20
 * Copyright © RingCentral. All rights reserved.
 */
type TestType = 'skip' | 'only';

const _doTest = (
  description: string,
  fn: jest.ProvidesCallback,
  howTest: jest.It,
  isEach?: boolean,
  table?: any[],
) => {
  if (isEach) {
    howTest.each(...table)(description, fn);
  } else {
    howTest(description, fn);
  }
};

const _testable = function(Class: any, testType?: TestType) {
  const target = new Class();
  const keys = Reflect.ownKeys(Class.prototype).slice(1); // filter constructor

  const howDescribe = testType ? describe[testType] : describe;
  howDescribe(Class.name, () => {
    beforeEach(() => {
      jest.restoreAllMocks();
      jest.resetAllMocks();
      jest.clearAllMocks();
      jest.resetModules(); // reset jest.doMock
    });

    if (target.beforeAll) {
      beforeAll(target.beforeAll);
    }
    if (target.beforeEach) {
      beforeEach(target.beforeEach);
    }
    if (target.afterEach) {
      afterEach(target.afterEach);
    }
    if (target.afterAll) {
      afterAll(target.afterAll);
    }
    keys.forEach((fnName: string) => {
      const fn = target[fnName];
      if (!fn.testable) {
        return;
      }
      const { testType, description, isEach, table } = fn;
      // testType maybe skip or only or it
      const howTest = testType ? it[testType] : it;
      _doTest(description, fn, howTest, isEach, table);
    });
  });
};

function testable(Class: any) {
  _testable(Class);
}

testable.skip = function(Class: any) {
  _testable(Class, 'skip');
};

testable.only = function(Class: any) {
  _testable(Class, 'only');
};

export { testable };
