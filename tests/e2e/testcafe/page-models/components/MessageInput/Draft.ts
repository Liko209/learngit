/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-17 16:18:55
 * Copyright © RingCentral. All rights reserved.
 */

import { BasePage } from '../..';
import { Selector } from 'testcafe';
import { ReactSelector, waitForReact } from 'testcafe-react-selectors';

class Draft extends BasePage {
  get getMessageInputComponent(): Selector {
    return ReactSelector('JuiMessageInput Quill div div');
  }

  setText(content: string): this {
    return this.chain(async t =>
      await t.typeText(this.getMessageInputComponent, content),
    );
  }

  public ensureLoaded() {
    return this.chain(async (t) => {
      await waitForReact();
      await t.expect(this.getMessageInputComponent.exists).ok('ensure component exist', { timeout: 20000 });
    });
  }
}

export { Draft };
