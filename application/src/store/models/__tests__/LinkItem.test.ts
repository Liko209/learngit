/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import LinkItemModel from '../LinkItem';

describe('LinkItemModal', () => {
  it('new LinkItemModel', () => {
    const linkItemModal = LinkItemModel.fromJS({
      title: 'title',
      summary: 'summary',
      url: 'url',
      image: 'image',
      deactivated: 'deactivated',
      favicon: 'favicon',
      do_not_render: true,
      data: {
        provider_name: 'provider_name',
      },
    } as any);
    expect(linkItemModal.title).toBe('title');
    expect(linkItemModal.summary).toBe('summary');
    expect(linkItemModal.url).toBe('url');
    expect(linkItemModal.image).toBe('image');
    expect(linkItemModal.deactivated).toBe('deactivated');
    expect(linkItemModal.favicon).toBe('favicon');
    expect(linkItemModal.providerName).toBe('provider_name');
    expect(linkItemModal.doNotRender).toBeTruthy();
  });
  it('new LinkItemModel with default', () => {
    const linkItemModal = LinkItemModel.fromJS({
      url: 'url',
      deactivated: 'deactivated',
      favicon: 'favicon',
      data: {
        provider_name: 'provider_name',
      },
    } as any);
    expect(linkItemModal.title).toBe('');
    expect(linkItemModal.summary).toBe('');
    expect(linkItemModal.url).toBe('url');
    expect(linkItemModal.image).toBe('');
    expect(linkItemModal.deactivated).toBe('deactivated');
    expect(linkItemModal.favicon).toBe('favicon');
    expect(linkItemModal.providerName).toBe('provider_name');
    expect(linkItemModal.doNotRender).toBeFalsy();
  });
});
