import React, { Component } from 'react';

import { StudentsAssigning } from './StudentsAssigning/StudentsAssigning';

import './DistributionContent.scss';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

export class DistributionContent extends Component<Props> {

  public render() {
    const { store } = this.props;

    return (
      <div className="DistributionContent flexBox dirColumn">
        <StudentsAssigning store={store} />
      </div>
    );
  }
}
