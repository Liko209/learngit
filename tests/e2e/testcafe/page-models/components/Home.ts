/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-08-21 16:35:03
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactSelector } from 'testcafe-react-selectors';
import { BaseComponent } from '..';

class Home extends BaseComponent {
  get getHomeComponent() {
    return ReactSelector('Home');
  }

  public expectExistComponent() {
    return this.chain(async (t) => {
      await t.expect(this.getHomeComponent.exists).ok();
    });
  }

}

export { Home };
