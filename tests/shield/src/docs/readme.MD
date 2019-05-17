## S.H.I.E.L.D

> SHIELD is a test framework in order to enforce jest in Jupiter.
> SHIELD integrated some jest basic function.
> In addition, SHIELD applies some decorators to implement UT and IT.

## How to write test cases?

1.Each case should be isolation
2.Mock phase (prepare data，method/object mock)
3.Expectation phase (include execute phase)

In SHIELD, each decorator just step2 and each functions just step3. SHIELD will ensure each case is isolation.

## Basic

> SomeNeedTestClass is tested object.

```javascript
class SomeNeedTestClass {
  add(a, b) {
    return a + b;
  }
  sayHello(who) {
    return `hello ${who}`;
  }
}
```

> 1.Each test file should be warped by 'describe()' and first param should be the name of object that been tested.
> 2.Each methods for the object been tested(SomeNeedTestClass) should be marked as testable class, and class name is method name.
> 3.Each test case will be named t1,t2,t3... with decorator @test.

```javascript
import { testable, test } from 'shield';

describe('SomeNeedTestClass', () => {
  @testable
  class add {
    beforeEach() {
      this.someNeedTestClass = new SomeNeedTestClass();
    }
    // other hooks
    afterEach() {}
    beforeAll() {}
    afterAll() {}

    notTest() {
      console.log('if not decorator with @test, 不会被测试');
    }

    @test('should be return 2 if 1+1')
    t1() {
      expect(this.someNeedTestClass.add(1, 1)).toBe(2);
    }

    @test('should be return 3 if 1+2')
    t2() {
      expect(this.someNeedTestClass.add(1, 2)).toBe(3);
    }
  }

  @testable
  class sayHello {
    @test('should be return hello foo if name is foo ')
    t1() {
      const obj = new SomeNeedTestClass();
      expect(obj.sayHello('foo')).toBe('hello foo');
    }
  }
})
```

## @test

> @test should be startWith "should be" and must be has other keyword when or if

### For example

> @test('should be time format if createdAt is 2019/1/4')
> @test('should be get PROGRESS_STATUS.SUCCESS when postId > 0')
> @test('should be false when is not production or public')
