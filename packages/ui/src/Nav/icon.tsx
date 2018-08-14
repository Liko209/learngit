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

const Icon = styled(
  ({ component, ...props }) => React.cloneElement(component, props),
)`
  && {
    transition: all .2s ease;
    color: #bfbfbf;
  }
`;

const ListsArr = [
  [
    {
      url : '1',
      title : 'Messages',
      type: 'umi',
      num: '99+',
      icon : (props) => <Icon component={<Message/>} {...props} />,
    }, {
      url : '2',
      title : 'Calls',
      type: 'umi',
      num: '99',
      icon : (props) => <Icon component={<Phone/>} {...props} />,
    }, {
      url : '3',
      title : 'Meetings',
      type: 'umi',
      num: '9',
      icon : (props) => <Icon component={<Videocam/>} {...props} />,
    },
  ], [
    {
      url : '4',
      title : 'Dashboard',
      icon : (props) => <Icon component={<Dashboard/>} {...props} />,
    }, {
      url : '5',
      title : 'Calendar',
      type: 'red',
      icon : (props) => <Icon component={<DateRange/>} {...props} />,
    }, {
      url : '6',
      title : 'Tasks',
      type: 'red',
      icon : (props) => <Icon component={<AssignmentTurnedIn/>} {...props} />,
    }, {
      url : '7',
      type: 'umi',
      num: '99',
      title : 'Files',
      icon : (props) => <Icon component={<FileCopy/>} {...props} />,
    }, {
      url : '8',
      title : 'Links',
      icon : (props) => <Icon component={<Link/>} {...props} />,
    }, {
      url : '9',
      title : 'Notes',
      icon : (props) => <Icon component={<LibraryBooks/>} {...props} />,
    }, {
      url : '10',
      title : 'Integration',
      icon : (props) => <Icon component={<AddBox/>} {...props} />,
    },
  ],
];

export default ListsArr;
