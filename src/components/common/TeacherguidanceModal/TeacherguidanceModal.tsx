import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import './TeacherguidanceModal.scss';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';

interface Props {
  currentEntity: DraftTeachingPath;
}

@inject('editTeachingPathStore')
@observer
export class TeacherguidanceModal extends Component<Props> {
  public static contextType = ItemContentTypeContext;

  public render() {
    return (
      <div className="modalContentTG">
        <div className="modalContentTG__header">
          <h1>ADD TEACHER GUIDANCE</h1>
          <span>How is the teacher supposed to use this teaching path?</span>
          <button type="button" className="modalContentTG__header__close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className="modalContentTG__body">
          <form>
            <div className="form-group">
              <DescriptionEditor
                description={this.props.currentEntity.description}
              />
            </div>
          </form>
        </div>
        <div className="modalContentTG__footer">
          <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" className="btn btn-primary">Send message</button>
        </div>
      </div>
    );
  }
}
