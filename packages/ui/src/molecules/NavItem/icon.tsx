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
import Settings from '@material-ui/icons/Settings';
import Person from '@material-ui/icons/Person';

const Icon = styled<TIconProps>(
  ({ component, ...props }) => React.cloneElement(IconComponent[component], props),
)`
  && {
    width: 20px;
    transition: all .2s ease;
    color: ${ ({ active, theme }) => active ?
    theme.palette.primary.main : theme.palette.accent.ash};
  }
`;

const IconComponent = {
  get Messages() {
    return <Message />;
  },
  get Phone() {
    return <Phone />;
  },
  get Meetings() {
    return <Videocam />;
  },
  get Dashboard() {
    return <Dashboard />;
  },
  get Calendar() {
    return <DateRange />;
  },
  get Tasks() {
    return <AssignmentTurnedIn />;
  },
  get Files() {
    return <FileCopy />;
  },
  get Notes() {
    return <LibraryBooks />;
  },
  get Links() {
    return <Link />;
  },
  get Integration() {
    return <AddBox />;
  },
  get Settings() {
    return <Settings />;
  },
  get Contacts() {
    return <Person />;
  },
};

const NavIcon = (props: TIconProps) => {
  return <Icon component={props.component} {...props}/>;
};
type TIconProps = {
  active: number,
  component: string,
  className: string,
};
export default NavIcon;
