# E2E测试文档 #

## 示例 ##

``` typescript

import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';

fixture('Send Messages')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Send message', ['P0', 'JPT-77']), async (t) => {
  const users = h(t).rcData.mainCompany.users;

  const loginUser = users[3];
  const app = new AppRoot(t);

  await h(t).withLog(`Given I login Jupiter with ${loginUser.company.number}#${loginUser.extension}`, async () => {
    await h(t).directLoginWithUser(SITE_URL, loginUser);
    await app.homePage.ensureLoaded();
  });

  await h(t).withLog('When I enter a conversation', async () => {
    await app.homePage.messageTab.directMessagesSection.expand();
    await app.homePage.messageTab.directMessagesSection.nthConversationEntry(0).enter();
  });

  const identifier = uuid();
  const message = `${faker.lorem.sentence()} ${identifier}`;

  const conversationSection = app.homePage.messageTab.conversationSection;
  await h(t).withLog('Then I can send message to this conversation', async () => {
    await conversationSection.sendMessage(message);
  });

  await h(t).withLog('And I should read this message from post list', async () => {
    await t.expect(conversationSection.posts.child().withText(identifier).exists).ok();
  }, true);
});
```

## 编写测试 ##

### 模版 ###

可以使用以下模版做为所有测试的起点

```typescript
import { formalName } from '../../libs/filter';
import { h } from '../../v2/helpers'
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';

fixture('Fixture Name')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Case1 Name', ['tag1', 'tag2']), async (t) => {
  // steps
});
test(formalName('Case2 Name', ['tag1', 'tag2']), async (t) => {
  // steps
});
/* more cases */
```

###  Page Model 的使用 ###

重构后的Page Model提供了一个统一的访问入口: AppRoot

在每个测试的开始处通过以下代码初始化一个 AppRoot 实例, 后续即可通过该实例访问页面元素并执行页面操作

```typescript
const app = new AppRoot(t);
```

由于涉及 Page Model 的改动可能会影响大量cases, 提交此类更改时请务必经过SDET评审.

### 工具库的使用 ###

在编写e2e测试时, 除了可使用 testcafe 提供的 TestController 进行基本的页面操作外, 我们另外提供了一个帮助库h(t), 用于封装 testcafe 的部分常用操作, 以及框架以外的功能, 如SDK, 日志, ...

以下为工具库常用功能的访问方式

```typescript
import { formalName } from '../../libs/filter';
import { setupCase, teardownCase } from '../../init';
import { AppRoot } from "../../v2/page-models/AppRoot";
import { SITE_URL } from '../../config';
import { h } from '../../v2/helpers' // 导入工具库

fixture('Fixture Name')
  .beforeEach(setupCase('GlipBetaUser(1210,4488)'))
  .afterEach(teardownCase());

test(formalName('Case1 Name', ['tag1', 'tag2']), async (t) => {
  /* 测试数据 */
  h(t).rcData; // 测试数据入口
  const loginUser = h(t).rcData.mainCompany.users[0];  // 从测试数据中获取一个用户账号
  
  /* sdk */
  await h(t).platform(loginUser).init(); // 获取以user身份登录的sdk实例(包括glip和platform)
  await h(t).glip(loginUser).init();

  /* 日志 */
  await h(t).log('hello world'); // 向报告写入一条记录
  await h(t).withLog('hello world', async () => {  
    // steps
  });  // 写入一条记录, 自动跟踪执行结果和执行时间

  /* more step */

});
```

### 测试数据使用规则 ###

目前 h(t).rcData.mainCompany 中提供了 8 个用户账号, 4个 teams 用于在测试中使用. 为了让测试可以更稳定地运行, 在测试中请遵循如下的测试使用规则

* h(t).rcData.mainCompany.users[0 - 3]: 只读, 避免在该账号上执行会改变后端服务状态的操作, 如重置, 更名, 更改权限, 标记为收藏; 但可以执行消息发送; 如需其它操作请参考下条
* h(t).rcData.mainCompany.users[4 - 7]: 可写, 会引起后端服务状态改变的操作请在该类账号执行
* h(t).rcData.mainCompany.teams[0 - 3]: 只读, 避免在该账号上执行会改变后端服务状态的操作, 如更改成员, 组名等; 但可以执行消息发送, 如果其它操作请参考下条
* 如果需要执行会引起后端服务状态改变的操作, 如测试更新 team 名称或成员, 请新建一个 team 进行操作

### 规范测试报告 ###

使用 Given-When-Then 的形式对测试步骤进行描述.

尽量使用 h(t).withLog 方法执行测试步骤并写入报告, 该方法可自动记录步骤时间和执行结果, 帮助我们更好地对测试结果进行分析.

一个较理想的报告示例如下:

![报告示例](./res/report-sample.png)



## 贴士 ##

#### 对于testcafe不提供的接口, 尝试从h(t)中寻找 ####

对于testcafe中不提供的接口(如获取 href, refresh 等), 优先从 h(t) 中寻找.

#### 存在性断言, 优先使用 withText, 避免使用 contains, 除非被断言对象有明确的id ####

```typescript
await t.expect(parentSelector.withText('john').exists).ok()
```

#### 优先使用 uuid 和faker 库生成随机内容, 避免使用时间截或者Math.random ####

```typescript
import * as faker from 'faker/locale/en';
import { v4 as uuid } from 'uuid';

const teamName = `Team ${uuid()}`;
const message = faker.lorem.sentence();
```

####  当元素可能被tooltip阻挡而影响点击时, 可以通过在执行点击前执行 hover('html') 规避 ####

```typescript
await t.hover('html').click(button);
```

#### 在必要时可以在测试开始时重置账号, 以确保数据清洁 ####

需注意重置操作仅可用于 users[4 - 7], 并且只在必要时使用(如需要做大量的状态预配置时), 否则会降低测试执行效率

```typescript
    const users = h(t).rcData.mainCompany.users;
    const loginUser = users[4];
    await h(t).resetGlipAccount(loginUser); // 重置用户
    await h(t).platform(loginUser).init(); // init platform sdk before using

    let chat, group;
    await h(t).withLog('Given I have an extension with 1 private chat and 1 group chat', async () => {
      chat = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'PrivateChat', members: [loginUser.rcId, users[5].rcId],
      });
      group = await h(t).platform(loginUser).createAndGetGroupId({
        type: 'Group', members: [loginUser.rcId, users[5].rcId, users[6].rcId],
      });
    }); // 确保该用户只存在一个private chat 与 group
```



## 测试文件规范 ##

#### 测试文件结构应当与QA在Einstein中对应用例的目录结构一致 ####

例如, 用例 JPT-5 位于 Einstein 中的 Left Rail Panel -> Conversation List -> Direct Messages 下, 相应的自动化测试用例将被置于 ./fixtures/LeftRailPanel/ConversationList/DirectMessages/ 目录下的 JPT-5.ts 文件. 目录名采用驼峰式规则.

#### Case 名称规范 ####

Case 名称应当与 Einstein 中的名称保持一致

#### Tag 使用规范 ####

每个 Case 都应当按顺序提供以下 Tag: Einstein ID, Priority, Owner, Compoent 其中

Einstein ID: 用于与用例进行关联, 如 JPT-5

Priority: 优先级, 如 P1

Owner: 创建者, 如 john.doe

Component: 对应的组件关键字, 可以有多个

一个完整的tag示例如下

```typescript
formalName('Direct Messages section displays the conversation between the user and another/multiple Glip user', ['JPT-5', 'P0', 'john.doe', 'DirectMessage'])
```

