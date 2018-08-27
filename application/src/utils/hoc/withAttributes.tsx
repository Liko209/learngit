import React, { Component } from 'react';
import ReactDOM from 'react-dom';

function withAttributes(WrappedComponent: any, attrs: object) {
  return class extends Component<any> {
    ref: React.RefObject<any>;

    constructor(props: any) {
      super(props);
      this.ref = React.createRef();
    }

    componentDidMount() {
      const el = ReactDOM.findDOMNode(this.ref.current);
      if (el && el instanceof HTMLElement) {
        Object
          .entries(attrs)
          .forEach(([key, value]) => {
            el.setAttribute(key, value);
          });
      }
    }

    render() {
      return (
        <WrappedComponent ref={this.ref} {...this.props}>
          {this.props.children}
        </WrappedComponent>
      );
    }
  };
}

export { withAttributes };
