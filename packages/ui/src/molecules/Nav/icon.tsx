import React from 'react';
import styled from 'styled-components';
import Message from '@material-ui/icons/Message';
import Phone from '@material-ui/icons/Phone';
import Videocam from '@material-ui/icons/Videocam';
import Dashboard from '@material-ui/icons/Dashboard';
import DateRange from '@material-ui/icons/DateRange';
import AssignmentTurnedIn from '@material-ui/icons/AssignmentTurnedIn';
import FileCopy from '@material-ui/icons/FileCopy';
import AddBox from '@material-ui/icons/AddBox';
import LibraryBooks from '@material-ui/icons/LibraryBooks';
import Link from '@material-ui/icons/Link';

const Icon = styled<TIconProps>(
  ({ component, ...props }) => React.cloneElement(IconComponent[component], props),
)`
  && {
    width: 20px;
    transition: all .2s ease;
    color: ${props => props.active ? '#0684BD' : '#bfbfbf'};
  }
`;

const IconComponent = {
  get messages() {
    return <Message />;
  },
  get calls() {
    return <Phone />;
  },
  get meetings() {
    return <Videocam />;
  },
  get dashboard() {
    return <Dashboard />;
  },
  get calendar() {
    return <DateRange />;
  },
  get tasks() {
    return <AssignmentTurnedIn />;
  },
  get files() {
    return <FileCopy />;
  },
  get notes() {
    return <LibraryBooks />;
  },
  get links() {
    return <Link />;
  },
  get integration() {
    return <AddBox />;
  },
};

const NavIcon = (props: TIconProps) => {
  return <Icon component={props.component} {...props}/>;
};
type TIconProps = {
  component: string,
  active: boolean,
};
export default NavIcon;
