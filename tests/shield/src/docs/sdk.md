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
    @mockService(PostService, 'methodName')
    @mockService(PostService, 'methodName', data)
    @mockService(PostService, 'methodName', () => {})
    @mockService.resolve(PostService, 'methodName')
    @mockService.reject(PostService, 'methodName')
    @mockService.reject(PostService, 'methodName')
    @mockService.resolve(PostService, [
      {
        method: 'methodName1', // will mockResolveValue
        data: args => { return false },
      }, {
        method: 'methodName2',
        type: 'reject', // will mockRejectedValue
        data: args => { return false },
      },
    ])
    @mockService(itemService, 'methodName', data)
    @mockService(itemService, 'methodName', data)
    t1() {}
  }
})
```
