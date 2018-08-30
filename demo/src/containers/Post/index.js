/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-02-28 13:38:31
 * @Last Modified by: Jeffrey Huang (jeffrey.huang@ringcentral.com)
 * @Last Modified time: 2018-06-19 16:12:18
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Markdown } from 'glipdown';
import { observer } from 'mobx-react';

import Avatar from '#/containers/Avatar';
import Activity from '#/containers/Activity';
import Items from '#/containers/Items';
import Attachment from '#/containers/Attachment';
import { TYPE } from '#/constants';
import storeManager, { ENTITY_NAME } from '#/store';

import Wrapper from './Wrapper';
import Left from './Left';
import Right from './Right';
import Header from './Header';
import Main from './Main';
import Timestamp from './Timestamp';
import Actions from './Actions/index';

import { glipdown2html, html2react } from './utils';

// file's typeid is 10
const getFiles = items => items.filter(item => TYPE[item.type_id] === 'file');

@observer
class Post extends Component {
  static propTypes = {
    id: PropTypes.number.isRequired
  };

  render() {
    const { id, highlightParser, hideAction } = this.props;
    const store = storeManager.getEntityMapStore(ENTITY_NAME.POST);
    const post = store.get(id);
    const {
      text,
      items = [],
      creator_id: presonId = 0,
      created_at: createdAt,
      at_mention_non_item_ids: atMentionNonItemIds = []
    } = post;

    // dynamic display person name
    const personStore = storeManager.getEntityMapStore(ENTITY_NAME.PERSON);
    const kv = {};
    atMentionNonItemIds.forEach(personId => {
      kv[personId] = personStore.get(personId).displayName;
    });

    const str1 = Markdown(text);
    const str2 = glipdown2html(str1);
    let html = html2react(str2, kv);
    if (highlightParser) {
      html = highlightParser(html);
    }
    // console.log(`original:\n${text}`);
    // console.log(`original --> glipdown:\n${str1}`);
    // console.log(`glipdown --> html:\n${str2}`);
    // console.log(`html --> react:\n${html}`);
    const files = getFiles(items);

    return (
      <Wrapper id={id} className={this.props.className}>
        <Left>
          <Avatar id={presonId} type="person" />
        </Left>
        <Right>
          <Header>
            <Activity personId={presonId} postId={id} />
            <Timestamp>{moment(createdAt).format('llll')}</Timestamp>
            {id > 0 && !hideAction && <Actions postId={id} />}
          </Header>
          <Main dangerouslySetInnerHTML={{ __html: html }} />
          <Items items={items} />
          {files.length > 0 && <Attachment files={files} />}
        </Right>
      </Wrapper>
    );
  }
}

export default Post;
