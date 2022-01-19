import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import closeImg from 'assets/images/modal-close.svg';
import downloadImg from 'assets/images/download.svg';

import { DescriptionEditor } from '../NewAssignment/Questions/DescriptionEditor';
import { CreateButton } from 'components/common/CreateButton/CreateButton';

import 'assignment/view/TeacherGuidance/TeacherGuidanceAssigModal.scss';

import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { NewAssignmentStore } from '../NewAssignment/NewAssignmentStore';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  assignment: DraftAssignment;
  readOnly?: boolean;
}

@inject('newAssignmentStore')
@observer
export class TeacherGuidanceAssigModal extends Component<Props> {

  public closeModalTG = () => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTGAssig') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGAssigBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.remove('open');
    modalTGBack[0].classList.add('hide');
  }

  public renderFooterButtons = () => (
    <div className="modalContentTGAssig__footer__aligLeft">
      <CreateButton
        title={intl.get('notifications.cancel')}
        onClick={this.closeModalTG}
        pink={true}
      >
        {intl.get('notifications.cancel')}
      </CreateButton>
      &nbsp;
      <CreateButton
        title={intl.get('teacherGuidance.save_and_close')}
        onClick={this.closeModalTG}
        green={true}
      >
        {intl.get('teacherGuidance.save_and_close')}
      </CreateButton>
    </div>
  )
  public handleDownloadAsPDF = () => {
    const { newAssignmentStore, assignment } = this.props;
    newAssignmentStore!.downloadTeacherGuidancePDF(assignment.id);
  }

  public render() {
    const { readOnly } = this.props;
    const titleTG = intl.get('teacherGuidance.titleRead');
    const titleTGSub = intl.get('teacherGuidance.titleSubReadAssig');

    return (
      <div>
        <div className="modalContentTGAssig">
          <div className="modalContentTGAssig__header">
            <h1>{titleTG}</h1>
            <span>{titleTGSub}</span>
            <div className="modalContentTGAssig__header__close">
              <img
                src={closeImg}
                alt={intl.get('generals.close')}
                title={intl.get('generals.close')}
                onClick={this.closeModalTG}
              />
            </div>
          </div>
          <div className="modalContentTGAssig__body">
            <div className="modalContentTGAssig__body__row first">
              123
            </div>
          </div>
          <div className="modalContentTGAssig__footer">
          {readOnly !== true && this.renderFooterButtons()}
            <div className="modalContentTGAssig__footer__aligRight">
              <button onClick={this.handleDownloadAsPDF}>
                <span>{intl.get('teacherGuidance.download_pdf')}</span>
                <img src={downloadImg} />
              </button>
            </div>
          </div>
        </div>
        <div className="modalContentTGAssigBackground hide">&nbsp;</div>
      </div>
    );
  }
}
