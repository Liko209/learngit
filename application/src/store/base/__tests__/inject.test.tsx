import React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import InjectDemo from './InjectDemo';
import MultiEntityMapStore from '../MultiEntityMapStore';
import storeManager, { ENTITY_NAME } from '../../';

let renderer: ReactWrapper;

const eventMap = {
  visibilitychange: () => { },
};
document.addEventListener = jest.fn((event, cb) => {
  eventMap[event] = cb;
});

describe.only('Inject store', () => {
  beforeEach(() => {
    renderer = mount(<InjectDemo />);
  });

  afterEach(() => {
    renderer.unmount();
    eventMap.visibilitychange();
  });

  it('Will return a object contain id equal to 1', () => {
    expect(renderer.text()).toEqual(`demo: ${JSON.stringify({ id: 1 })}`);
  });

  it('usedIds that is a attribute in MultiEntityMapStore will contain only one mount instance', () => {
    const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST) as MultiEntityMapStore<any, any>;
    expect(postStore.usedIds.size).toEqual(1);

  });

  it('usedIds that is a attribute in MultiEntityMapStore will contain a mount instance', () => {
    const postStore = storeManager.getEntityMapStore(ENTITY_NAME.POST) as MultiEntityMapStore<any, any>;
    const usedIds = postStore.usedIds.get(renderer.instance()) as Set<number>;
    expect(usedIds).not.toBeUndefined();
    expect(usedIds.has(1)).toBeTruthy();
  });
});
