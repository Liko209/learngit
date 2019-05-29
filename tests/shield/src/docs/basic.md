## testable testable.only testable.skip

> only for class

```javascript
describe('demo', () => {
  @testable
  class MethodA {
    @test('')
    t1() {}
  }

  @testable.skip
  class MethodA {
    @test('')
    t1() {}
  }

  @testable.only
  class MethodA {
    @test('')
    t1() {}
  }
});
```

## test test.only test.skip

> only for each methods

```javascript
describe('demo', () => {

  class MethodA {

    @test('')
    t1() {}

    @test.skip('')
    t2() {}

    @test.only('')
    t3() {}
  }
});
```

## each

> only for each methods

```javascript
describe('demo', () => {
  class MethodA {
    @(test.each`
      data               | expected
      ${DATE_2019_1_3}   | ${'Thu, 9:21 AM'}
      ${DATE_2019_1_2}   | ${'Wed, 9:21 AM'}
      ${DATE_2018_12_30} | ${'Sun, 9:21 AM'}
      ${DATE_2018_12_29} | ${'Sat, 9:21 AM'}
    `('should be Weekday format when createdAt is $data. [JPT-701]'))
    // mockEntity will inject each data
    // other decorator need implement inject each data
    @mockEntity(({ data }) => ({
      createdAt: data,
      creatorId: 107913219,
    }))
    async t5({ expected }) {
      const conversationCardVM = new ConversationCardViewModel();
      global.Date.now = jest.fn(() => DATE_2019_1_4);
      expect(await conversationCardVM.createTime.fetch()).toBe(expected);
    }
  }
});
```
