import React from 'react';
import { observer } from 'mobx-react';
import {
  ConversationListSection,
  Icon,
  ConversationList,
} from 'ui-components';
import ConversationListItemCell from '../ConversationListItemCell';
import { IConversationSectionPresenter } from './IConversationSection';
import DirectMessageListPresenter
  from '../../../containers/Conversations/sections/DirectMessageListPresenter';
interface IProps {
  expanded?: boolean;
  presenter: IConversationSectionPresenter;
}

@observer
class ConversationSection
  extends React.Component<IProps> {
  static defaultProps = {
    expanded: true,
  };

  componentDidMount() {
    this.props.presenter.fetchData();
  }

  renderList() {
    const { presenter } = this.props;
    const store = presenter.getStore();
    const ids = store.getIds();
    const entityName = presenter.entityName;
    const currentUserId =
      presenter instanceof DirectMessageListPresenter &&
        presenter.getCurrentUserId &&
        presenter.getCurrentUserId() ? presenter.getCurrentUserId() as number : undefined;
    return (
      <ConversationList>
        {ids.map(id => (
          <ConversationListItemCell
            id={id}
            key={id}
            entityName={entityName}
            currentUserId={currentUserId}
          />
        ))}
      </ConversationList>
    );
  }

  render() {
    const { title, anchor, iconName } = this.props.presenter;
    return (
      <div data-anchor={anchor}>
        <ConversationListSection
          icon={<Icon>{iconName}</Icon>}
          title={title}
          expanded={this.props.expanded}
        >
          {this.renderList()}
        </ConversationListSection>
      </div >
    );
  }
}

export { ConversationSection };
export default ConversationSection;
