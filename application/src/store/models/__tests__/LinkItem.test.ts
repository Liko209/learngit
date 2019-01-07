/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:53:17
 * Copyright © RingCentral. All rights reserved.
 */
import LinkItemModel from '../LinkItem';

describe('LinkItemModel', () => {
  it('new LinkItemModel', () => {
    const linkItemModel = LinkItemModel.fromJS({
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
    expect(linkItemModel.title).toBe('title');
    expect(linkItemModel.summary).toBe('summary');
    expect(linkItemModel.url).toBe('url');
    expect(linkItemModel.image).toBe('image');
    expect(linkItemModel.deactivated).toBe('deactivated');
    expect(linkItemModel.favicon).toBe('favicon');
    expect(linkItemModel.providerName).toBe('provider_name');
    expect(linkItemModel.doNotRender).toBeTruthy();
  });
  it('new LinkItemModel with default', () => {
    const linkItemModel = LinkItemModel.fromJS({
      url: 'url',
      deactivated: 'deactivated',
      favicon: 'favicon',
      data: {
        provider_name: 'provider_name',
      },
    } as any);
    expect(linkItemModel.title).toBe('');
    expect(linkItemModel.summary).toBe('');
    expect(linkItemModel.url).toBe('url');
    expect(linkItemModel.image).toBe('');
    expect(linkItemModel.deactivated).toBe('deactivated');
    expect(linkItemModel.favicon).toBe('favicon');
    expect(linkItemModel.providerName).toBe('provider_name');
    expect(linkItemModel.doNotRender).toBeFalsy();
  });
});
