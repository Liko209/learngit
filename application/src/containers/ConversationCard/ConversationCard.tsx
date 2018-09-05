import React from 'react';
import storeManager, { ENTITY_NAME } from '@/store';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/models';
import { observer } from 'mobx-react';
import moment from 'moment';
interface IProps {
  style?: React.CSSProperties;
  id:number;
}

@observer
export class ConversationCard extends React.Component<IProps>{
  render() {
    const { id, ...rest } = this.props;
    const store = storeManager.getEntityMapStore(ENTITY_NAME.POST) as MultiEntityMapStore<Post, PostModel>;
    const post :PostModel = store.get(id);
    const {
            text,
            createdAt,
          } = post;
    return  <div style={{ height:50, overflow:'hidden' }}{...rest}>Time:{moment(createdAt).format('llll')}, {text}</div>;
  }
}
export default ConversationCard;
