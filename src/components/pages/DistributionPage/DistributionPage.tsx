import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import { DistributionTitle } from './DistributionTitle/DistributionTitle';
import { DistributionActions } from './DistributionActions/DistributionActions';
import { DistributionContent } from './DistributionContent/DistributionContent';
import { DistributionSummary } from './DistributionSummary/DistributionSummary';

import './DistributionPage.scss';

interface Props extends RouteComponentProps<{id: string}> {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

@observer
class DistributionPageComponent extends Component<Props> {
  public async componentDidMount() {
    const { store, match } = this.props;
    await store!.getDistributionData(Number(match!.params.id));
  }

  public render() {
    const { store } = this.props;
    const distributionLink = store!.currentDistribution ?
      store!.currentDistribution.referralLink :
      'Loading...';

    return (
      <div className="DistributionPage flexBox spaceBetween">
        <div className="distributionInfo w50">
          <DistributionTitle
            title={store!.currentEntity!.title}
            description={store!.currentEntity!.description}
            localeKey={store!.localeKey}
          />

          <DistributionActions
            distributionLink={distributionLink}
          />

          <DistributionSummary
            store={store}
            localeKey={store!.localeKey}
          />
        </div>

        <DistributionContent store={store} />
      </div>
    );
  }
}

export const DistributionPage = withRouter(DistributionPageComponent);
