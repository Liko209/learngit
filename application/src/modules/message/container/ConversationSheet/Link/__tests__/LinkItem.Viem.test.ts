/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-04-22 09:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { LinkItemView } from '../LinkItem.View';
import { LinkItemModel, LinkItemViewProps } from '../types';

describe('ConversationSheet LinkItemView fix(bug/FIJI-5192)', () => {
  it('Should link card be rendered when doNotRender untold', () => {
    const item = { doNotRender: false };
    const view = new LinkItemView({} as LinkItemViewProps);

    view.renderLinkCard = jest.fn();

    view.renderContent(item as LinkItemModel);

    expect(view.renderLinkCard).toHaveBeenCalled();
  });

  it('Should link content be rendered when doNotRender told', () => {
    const item = { doNotRender: true };
    const view = new LinkItemView({} as LinkItemViewProps);

    view.renderLinkText = jest.fn();

    view.renderContent(item as LinkItemModel);

    expect(view.renderLinkText).toHaveBeenCalled();
  });

  it('Should render content be empty when post from conversation input', () => {
    const post = { text: 'text' };
    const item = { id: 1, url: 'www.text.com', title: 'text' };
    const view = new LinkItemView({ post } as LinkItemViewProps);

    const mockRenderFn = jest.spyOn(view, 'renderLinkText');

    view.renderLinkText(item as LinkItemModel);

    expect(mockRenderFn).toHaveReturnedWith(null);
  });

  it('Should render content be card when post from link sharing', () => {
    const post = { text: '' };
    const item = { id: 1, url: 'www.text.com', title: 'text' };
    const view = new LinkItemView({ post } as LinkItemViewProps);

    const mockRenderFn = jest.spyOn(view, 'renderLinkText');

    view.renderLinkText(item as LinkItemModel);

    expect(mockRenderFn.mock.results[0]).not.toBeNull();
  });
});
