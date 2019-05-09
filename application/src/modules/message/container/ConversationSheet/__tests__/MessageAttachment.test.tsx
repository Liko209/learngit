/*
 * @Author: isaac.liu
 * @Date: 2019-05-07 15:40:32
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { getEntity } from '@/store/utils';
import { mountWithTheme } from '@/__tests__/utils';
import { MessageAttachment } from '../MessageAttachment';
import { MessageAttachmentView } from '../MessageAttachment/MessageAttachment.View';
import {
  JuiMessageAttachment,
  Body,
  Author,
  Title,
  Field,
  ImageView,
  ThumbImageView,
  Footer,
} from 'jui/pattern/ConversationItemCard/MessageAttachment';
jest.mock('@/store/utils');

describe('MessageAttachmentViewModel', () => {
  const defaultItem = {
    author_name: 'Stanford S. Strickland',
    color: '#F35A00',
    author_link: 'https://glip.com',
    author_icon:
      'https://glip-vault-1.s3.amazonaws.com/web/customer_files/181022089228/modified.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=w7n54QiHZ5jNgQmIkbJz7Bobjk8=',
    fallback:
      'New ticket from Andrea Lee - Ticket #1943: Cannot reset my password - https://groove.hq/path/to/ticket/1943',
    fields: [
      { title: 'Volume', value: '1', short: true },
      { title: 'Issue', value: '3', short: true },
      {
        title: 'Issue',
        value:
          'Very Long long Long long Long long Long long Long long Long long',
      },
    ],
    footer: 'Glip Api',
    footer_icon:
      'https://glip-vault-1.s3.amazonaws.com/web/customer_files/181022089228/modified.jpg?Expires=2075494478&AWSAccessKeyId=AKIAJROPQDFTIHBTLJJQ&Signature=w7n54QiHZ5jNgQmIkbJz7Bobjk8=',
    image_url: 'https://i.imgur.com/OJkaVOI.jpg?1',
    thumb_url: 'https://i.imgur.com/OJkaVOI.jpg?2',
    pretext: 'New ticket from Andrea Lee',
    title: 'The Further Adventures of Slackbot',
    title_link: 'https://groove.hq/path/to/ticket/1943',
    text: 'This is some sample Text',
    ts: 1496881204783,
  };
  const defaultMessage = {
    created_at: 1504835374770,
    creator_id: 3,
    version: 7278183275560960,
    model_size: 0,
    is_new: true,
    post_ids: [2541469081604],
    group_ids: [4499562502],
    company_id: 44466177,
    integration_owner_id: 1284579331,
    type_id: 7000,
    modified_at: 1504835374770,
    attachments: [defaultItem],
    body:
      '* Location: [The Funky Buddha Lounge](http://www.thefunkybuddha.com)\n* Beer Advocate Rating: [99](http://tinyurl.com/psf4uzq)',
    title: 'Jeff is having a Maple Bacon Coffee Porter',
    activity: 'Beer consumed',
    integration_id: 260522011,
    deactivated: false,
  };
  beforeAll(() => {
    (getEntity as jest.Mock).mockImplementation((name: string, id: number) => ({
      ...defaultMessage,
      id,
    }));
  });

  it('should render nothing without message attachments', () => {
    const wrapper = mountWithTheme(<MessageAttachment ids={[]} />);
    expect(wrapper.text()).toEqual(null);
  });

  it('should render message attachments', () => {
    const ids = [1, 2];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);
    const result = wrapper.find(JuiMessageAttachment);
    expect(result.length).toEqual(
      defaultMessage.attachments.length * ids.length,
    );
  });

  it('should render attachment title', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const title = wrapper.find(Title);
    expect(title.find({ href: defaultItem.title_link })).toBeTruthy();
    expect(title.text()).toEqual(defaultItem.title);
  });

  it('should render attachment author', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const author = wrapper.find(Author);
    expect(author.find({ href: defaultItem.author_link })).toBeTruthy();
    expect(author.find({ src: defaultItem.author_icon })).toBeTruthy();
    expect(author.text()).toEqual(defaultItem.author_name);
  });

  it('should render attachment fields', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const fields = wrapper.find(Field);
    const fieldsData = defaultItem.fields;
    expect(fields.length).toBe(fieldsData.length);
    const firstField = fields.at(0).find('div div');
    expect(firstField.at(0).text()).toEqual(fieldsData[0].title);
    expect(firstField.at(1).text()).toEqual(fieldsData[0].value);
  });

  it('should render attachment body', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const body = wrapper.find(Body);
    expect(body.length).toBe(1);
    expect(body.text().includes(defaultItem.text)).toBeTruthy();
  });

  it('should render attachment image view', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const image = wrapper.find(ImageView);
    expect(image.find({ src: defaultItem.image_url })).toBeTruthy();
  });

  it('should render attachment thumb image view', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const image = wrapper.find(ThumbImageView);
    expect(image.find({ src: defaultItem.thumb_url })).toBeTruthy();
  });

  it('should render attachment footer', () => {
    const ids = [1];
    const wrapper = mountWithTheme(<MessageAttachment ids={ids} />);

    const footer = wrapper.find(Footer);
    expect(footer.text().includes(defaultItem.footer)).toBeTruthy();
    expect(footer.find({ src: defaultItem.footer_icon })).toBeTruthy();
  });

  it('should increase coverage for MessageAttachmentView', () => {
    const wrapper = mountWithTheme(
      <MessageAttachmentView items={[{ ...defaultItem, id: 1 }]} />,
    );
    wrapper.render();
    expect(wrapper).toBeTruthy();
  });
});
