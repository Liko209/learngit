import React from 'react';
import { mount } from 'enzyme';
import InjectDemo from './InjectDemo';
import MultiEntityMapStore from '../MultiEntityMapStore';
import storeManager, { ENTITY_NAME } from '../../';

const eventMap = {
  visibilitychange: () => {},
};
document.addEventListener = jest.fn((event, cb) => {
  eventMap[event] = cb;
});

describe.only('Inject store', () => {
  it('Will return a object contain id equal to 1', () => {
    const renderer = mount(<InjectDemo id={1} />);
    expect(renderer.text()).toEqual(`demo: ${JSON.stringify({ id: 1 })}`);
  });

  it('usedIds that is a attribute in MultiEntityMapStore will contain only one mount instance', () => {
    const postStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<any, any>;
    const usedIds = postStore.getUsedIds();
    expect(usedIds.size).toEqual(1);
  });

  it('usedIds that is a attribute in MultiEntityMapStore will contain a mount instance', () => {
    const postStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<any, any>;
    const usedIds = postStore.getUsedIds() as Set<number>;
    expect(usedIds).not.toBeUndefined();
    expect(usedIds.has(1)).toBeTruthy();
  });

  it('usedIds is synchronous', () => {
    const c1 = mount(<InjectDemo id={1} />);
    const c2 = mount(<InjectDemo id={1} />);
    const postStore = storeManager.getEntityMapStore(
      ENTITY_NAME.POST,
    ) as MultiEntityMapStore<any, any>;
    const usedIds = postStore.getUsedIds() as Set<number>;
    expect(usedIds).not.toBeUndefined();
    expect(usedIds.has(1)).toBeTruthy();
    expect(usedIds.size).toEqual(1);
    c1.unmount();
    expect(usedIds).not.toBeUndefined();
    expect(usedIds.has(1)).toBeTruthy();
    expect(usedIds.size).toEqual(1);
    c2.unmount();
    expect(usedIds.size).toEqual(1);
  });
});
