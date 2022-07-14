import React, { Component } from 'react';
import { observer } from 'mobx-react';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';

import { Header } from './Header/Header';
import { QuestionsOverview } from './QuestionsOverview/QuestionsOverview';

import './PublishingContent.scss';
import { SelectCoverImage } from './SelectCoverImage/SelectCoverImage';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

@observer
export class PublishingContent extends Component<Props> {

  public render() {
    const { store } = this.props;

    return (
      <div className="PublishingContent flexBox dirColumn">
        <Header store={store} />

        <div className="teachingPathContent flexBox">
          <QuestionsOverview
            currentEntity={store!.currentEntity!}
            localeKey={store!.localeKey}
          />
          {/* <Versions /> */}
        </div>
        <SelectCoverImage currentEntity={store!.currentEntity!} localeKey={store!.localeKey} />
      </div>
    );
  }
}
