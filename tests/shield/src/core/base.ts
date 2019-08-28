/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-25 14:34:49
 * Copyright © RingCentral. All rights reserved.
 */
import { descriptorAOP } from '../core/utils';

function only(target: any) {
  target.testType = 'only';
}

function skip(target: any) {
  target.testType = 'skip';
}

const keyword = ['when', 'if'];

const _test = function(description: string, testType?: 'skip' | 'only') {
  if (!description.startsWith('should')) {
    throw new Error('@test should be startWith "should"');
  }
  if (!keyword.some((key: string) => description.includes(key))) {
    throw new Error('@test must be has keyword when or if');
  }
  return function(
    target: any,
    property: string,
    descriptor: PropertyDescriptor,
  ) {
    const oldFn = descriptor.value;
    descriptor.value = descriptorAOP(target, function() {}, oldFn);

    descriptor.value.description = description;
    descriptor.value.testable = true;
    if (testType) {
      descriptor.value.testType = testType;
    }
    return descriptor;
  };
};

function test(description: string) {
  return _test(description);
}

test.skip = function(description: string) {
  return _test(description, 'skip');
};

test.only = function(description: string) {
  return _test(description, 'only');
};

test.each = function(...values: any[]) {
  return function(description: string) {
    return function(
      target: any,
      property: string,
      descriptor: PropertyDescriptor,
    ) {
      const oldFn = descriptor.value;
      descriptor.value = descriptorAOP(target, function() {}, oldFn);

      descriptor.value.description = description;
      descriptor.value.testable = true;

      descriptor.value.isEach = true;
      descriptor.value.table = values;

      return descriptor;
    };
  };
};

export { test, only, skip };
