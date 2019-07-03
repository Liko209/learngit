## For UT

### mockService

```javascript
import { mockService } from 'shield/sdk';
import PostService from 'PostService';

describe('', () => {
  const data = {}

  const itemService = {
    name: ServiceConfig.ITEM_SERVICE,
    methodName() {}
  }

  @testable
  class SomeMethod {
    // mock single function without data
    @mockService(PostService, 'methodName')
    t1() {}

    // mock single function with data
    @mockService(PostService, 'methodName', data)
    t2() {}

    // mock single function with impl
    @mockService(PostService, 'methodName', (params) => {})
    t3() {}

    // mock service Class single resolve function 
    @mockService.resolve(PostService, 'methodName')
    t4() {}

    // mock service Class single reject function 
    @mockService.reject(PostService, 'methodName')
    t5() {}


    // mock service Class multi reject function 
    @mockService.resolve(PostService, [
      {
        method: 'methodName1', // will mockResolveValue
        data: args => { return false },
      },
    ])
    t6() {}

    // mock instance service if you should be test some function have been called 
    @mockService(itemService, 'methodName', data)
    t7() {
      expect(itemService.methodName).toHaveBeenCalled();
    }
  }

})
```
