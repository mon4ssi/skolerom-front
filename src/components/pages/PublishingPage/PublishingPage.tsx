import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { PublishingTitle } from './PublishingTitle/PublishingTitle';
import { PublishingActions } from './PublishingActions/PublishingActions';
import { PublishingContent } from './PublishingContent/PublishingContent';

import './PublishingPage.scss';

interface Props extends RouteComponentProps<{id: string}> {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

@observer
class PublishingPageComponent extends Component<Props> {

  public render() {
    const { store } = this.props;

    return (
      <div className="PublishingPage flexBox spaceBetween">
        <div className="publishingInfo w50">
          <PublishingTitle
            currentEntity={store!.currentEntity!}
            showValidationErrors={store!.showValidationErrors}
            localeKey={store!.localeKey}
          />

          <PublishingActions store={store} />
        </div>

        <PublishingContent store={store} />
      </div>
    );
  }
}

export const PublishingPage = withRouter(PublishingPageComponent);
