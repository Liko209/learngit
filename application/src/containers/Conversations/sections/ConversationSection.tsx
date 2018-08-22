import React from 'react';
import { observer } from 'mobx-react';
import {
  ConversationListSection,
  Icon,
  ConversationList,
} from 'ui-components';
import ConversationListItemCell from '../ConversationListItemCell';
import { IConversationSectionPresenter } from './IConversationSection';
interface IProps {
  expanded?:boolean;
  presenter: IConversationSectionPresenter;
}

interface IState {
  groups: Group[];
}

interface Group {
  id: number;
  display_name: string;
  is_team: boolean;
  members: number[];
}

@observer
class ConversationSection
extends React.Component<IProps, IState> {
  static defaultProps = {
    expanded:true,
  };

  componentDidMount() {
    this.props.presenter.fetchData();
  }

  renderList() {
    const store = this.props.presenter.getStore();
    const ids = store.getIds();
    const entityName = this.props.presenter.entityName;
    return (
      <ConversationList>
        {ids.map(id => (
          <ConversationListItemCell id={id} key={id} entityName={entityName} />
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
