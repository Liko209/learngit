## Store

## mockEntity/mockSingleEntity/mockGlobalValue for UT

```javascript
// need to test
@computed
get post() {
  return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
}

// test code
@testable
class post {
  @test('get post')
  @mockEntity(mockPostValue)
  t1() {
    const conversationCardVM = new ConversationCardViewModel();
    expect(conversationCardVM.post).toMatchObject({
      ...mockPostValue,
    });
  }
}
```

```javascript
// need to test
@computed
get shouldSkipCloseConfirmation() {
  return getSingleEntity<Profile, ProfileModel>(
    ENTITY_NAME.PROFILE,
    'skipCloseConversationConfirmation',
  );
}

// test code
@testable
class shouldSkipCloseConfirmation {
  @test('should return falsy for shouldSkipCloseConfirmation as default')
  @mockSingleEntity(false)
  t1() {
    const model = new MenuViewModel();
    expect(model.shouldSkipCloseConfirmation).toBeFalsy();
  }
}
```

```javascript
// need to test
@computed
private get _group() {
  if (this.conversationId) {
    return getEntity<Group, GroupModel>(
      ENTITY_NAME.GROUP,
      this.conversationId,
    );
  }
  return null;
}

@computed
get isMember() {
  if (this._group) {
    return (
      this._group.members && this._group.members.includes(this._currentUserId)
    );
  }
  return false;
}

// test code
@testable
class isMemeber {
  @test('should be true when current user id in group')
  @mockEntity({ members: [1, 2, 3] })
  @mockGlobalValue(1)
  t1() {
    const vm = new FavoriteViewModel({ id: initId });
    expect(vm.isMember).toBe(true);
  }
}
```

### store/globalStore for IT

```javascript
// store
import { test, testable } from 'shield';
import { mockStore } from 'shield/application';
import { store } from 'shield/integration-test';
import { LikeViewModel } from '../Like.ViewModel';
import { ENTITY_NAME } from '@/store';

describe('LikeViewModel', () => {
  @testable
  class _post {
    @test('_post')
    @mockStore(ENTITY_NAME.POST, {
      id: 1,
      text: 'text1',
    })
    getPost() {
      const likeViewModel = new LikeViewModel({ id: 1 });
      expect(likeViewModel._post).toMatchObject({
        text: 'text1',
      });
      // equal notification emit replace event
      store.replace(ENTITY_NAME.POST, {
        id: 1,
        text: 'text2',
      });
      expect(likeViewModel._post).toMatchObject({
        text: 'text2',
      });
    }
  }
});

```

```javascript
// mockSingleStore
import { test, mockSingleStore, testable } from 'tests/integration-test';
import { ENTITY_NAME } from '@/store';
import { BookmarkViewModel } from '../Bookmark.ViewModel';

describe('TestBookmarkViewModel', () => {
  @testable
  class bookmark {
    @test('_favoritePostIds')
    @mockSingleStore(ENTITY_NAME.PROFILE, {
      favorite_post_ids: [1, 2, 3],
    })
    favoritePostIds() {
      const bookmarkViewModel = new BookmarkViewModel({ id: 1 });
      expect(bookmarkViewModel._favoritePostIds).toEqual([1, 2, 3]);
    }
  }
});
```
