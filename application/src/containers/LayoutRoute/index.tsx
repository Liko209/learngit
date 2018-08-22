import React, { Component, ComponentClass, SFC } from 'react';
import { Route, RouteComponentProps } from 'react-router-dom';
import TreeLayout from '@/containers/Layout/TreeLayout';
import TwoLayout from '@/containers/Layout/TwoLayout';

interface IProps {
  path: string;
  Left?: ComponentClass | SFC;
  Middle?: ComponentClass | SFC;
  Right?: ComponentClass | SFC;
}

class LayoutRoute extends Component<IProps>  {
  constructor(props: IProps) {
    super(props);
  }

  render() {
    const { Left, Middle, Right, ...rest } = this.props;
    return (
      <Route {...rest}>
        {
          (props: RouteComponentProps<any>) => {
            if (Left && Middle && Right) {
              return <TreeLayout Left={Left} Middle={Middle} Right={Right} />;
            }
            if (Left && Right) {
              return <TwoLayout Left={Left} Right={Right} />;
            }
            return <div>Need at least Left and Right component</div>;
          }
        }
      </Route>
    );
  }
}

export default LayoutRoute;
