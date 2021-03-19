import React, { Component } from 'react';

export class RedirectPage extends Component {

  public componentDidMount() {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/api/dataporten/auth`;
  }

  public render() {
    return (<></>);
  }
}
