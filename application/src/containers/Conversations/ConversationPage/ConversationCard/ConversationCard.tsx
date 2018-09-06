
import React from 'react';
import  { ENTITY_NAME } from '@/store';
import { observer } from 'mobx-react';
import moment from 'moment';
import { styled, Divider } from 'ui-components';
import injectStore, { IComponentWithGetEntityProps } from '@/store/inject';
import PostModel from '@/store/models/Post';
interface IProps extends IComponentWithGetEntityProps {
  style?: React.CSSProperties;
  id: number;
  key:number;
}
/* Notice */
/* this should be removed once conversation card developed*/
const ConversationCardWrapper = styled.div`
  margin:10px;
  font-size:14px;
  color:#333;
  padding:20px;
  padding-top:0px;
  line-height:160%;
  text-align:justify;
  white-space: pre-wrap;
  word-break:break-all;
  span{
    color:#999;
    font-size:12px;
    padding-top:20px;
    margin-bottom:20px;
    display:block;
  }
`;

@observer
export class ConversationCard extends React.Component<IProps>{
  render() {
    const { id, getEntity, ...rest } = this.props;
    const post = getEntity(ENTITY_NAME.POST, id) as PostModel;
    const {
      text,
      createdAt,
    } = post;
    return (
      <React.Fragment>
      <ConversationCardWrapper {...rest} >
      <span>Time:{moment(createdAt).format('llll')}</span>
      {text}
      </ConversationCardWrapper>
      <Divider key="divider"/>
      </React.Fragment>
    );
  }
}

/* this should be removed once conversation card developed*/
export default injectStore()(ConversationCard);
