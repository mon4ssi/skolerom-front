import React, { Component } from 'react';
import intl from 'react-intl-universal';
import { observer } from 'mobx-react';

import './DistributionTitle.scss';

interface Props {
  title: string;
  description: string;
  localeKey: string;
}

@observer
export class DistributionTitle extends Component<Props> {
  public render() {
    const { title, description, localeKey } = this.props;

    return (
      <div className="DistributionTitle flexBox dirColumn">

        <span className="fw500">
          {intl.get(`distribution_page.${localeKey}.distribute_entity`)}
        </span>

        <div className="distributeTitle">
          {title}
        </div>

        <div className="distributeDescription fw300">
          {description}
        </div>
      </div>
    );
  }
}
