import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNull from 'lodash/isNull';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { CurrentQuestionaryStore } from 'assignment/view/CurrentAssignmentPage/CurrentQuestionaryStore';

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  currentEntityTeachingPath?: DraftTeachingPath;
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: CurrentQuestionaryStore;
}

@inject('questionaryTeachingPathStore')
@inject('newAssignmentStore')
@observer

export class DetailsModal extends Component<Props> {
  public render() {
    return (
        <div>HoliBoli</div>
    );
  }
}
