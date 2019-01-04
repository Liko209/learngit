/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-29 09:44:52
 * Copyright © RingCentral. All rights reserved.
 */
import portalManager, { EventKey } from '../PortalManager';

describe('portalManager', () => {
  beforeEach(() => {
    portalManager.portals = new Map();
    jest.restoreAllMocks();
  });

  it('portalManager register()', async () => {
    jest.spyOn(portalManager, 'emit');
    const comp: any = 1;
    portalManager.register(comp, {
      node: document.createElement('div'),
      dismiss: 2,
      props: {},
    } as any);

    expect(portalManager.emit).toHaveBeenCalledWith(
      'portalsChange',
      portalManager.portals,
    );

    portalManager.unRegister(comp);
    expect(portalManager.portals.size).toBe(0);
    expect(portalManager.emit).toHaveBeenCalledWith(
      EventKey,
      portalManager.portals,
    );
  });
  it('portalManager unRegister()', async () => {
    jest.spyOn(portalManager, 'emit');
    const comp: any = 1;
    portalManager.unRegister(comp);
    expect(portalManager.emit).toHaveBeenCalledTimes(0);
  });
  it('portalManager dismiss()', async () => {
    const cb = jest.fn();
    jest.spyOn(portalManager, 'emit');
    jest.spyOn(portalManager, 'unRegister');

    const comp: any = 1;
    portalManager.register(comp, {
      node: document.createElement('div'),
      dismiss: 2,
      props: {},
    } as any);

    portalManager.dismiss(cb);
    expect(portalManager.unRegister).toHaveBeenCalledWith(1);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('portalManager onChange()', async () => {
    const cb = jest.fn();
    jest.spyOn(portalManager, 'on');

    portalManager.onChange(cb);
    expect(portalManager.on).toHaveBeenCalled();
  });
});
describe('portalManager wrapper()', async () => {
  beforeEach(() => {
    portalManager.portals = new Map();
    jest.restoreAllMocks();
  });

  it('dismiss()', async () => {
    const cb = jest.fn();
    const comp: any = 1;
    jest.spyOn(portalManager, 'unRegister');
    jest.spyOn(portalManager, 'register');

    const obj = portalManager.wrapper(comp);

    obj.dismiss(cb);
    expect(portalManager.unRegister).toHaveBeenCalled();
    expect(cb).toHaveBeenCalled();
  });

  it('If call show continuity register() should be called once', async () => {
    const comp: any = 1;
    jest.spyOn(portalManager, 'unRegister');
    jest.spyOn(portalManager, 'register');

    const obj = portalManager.wrapper(comp);
    obj.show();
    obj.show();
    expect(portalManager.register).toHaveBeenCalledTimes(1);
  });
});
