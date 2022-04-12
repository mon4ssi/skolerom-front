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
import { CurrentQuestionaryStore } from '../CurrentAssignmentPage/CurrentQuestionaryStore';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: CurrentQuestionaryStore;
  readOnly?: boolean;
  openGuidance?: boolean;
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

  public componentDidMount() {
    const { readOnly, currentQuestionaryStore, newAssignmentStore, openGuidance } = this.props;
    if (readOnly) {
      if (currentQuestionaryStore!.assignment !== null) {
        if (currentQuestionaryStore!.assignment.hasGuidance) {
          const btnHeader = Array.from(document.getElementsByClassName('jr-btnHeaderTeacherGuidance') as HTMLCollectionOf<HTMLElement>);
          btnHeader[0].classList.remove('AppHeader__btnHeaderGuidance');
          if (openGuidance) { newAssignmentStore!.openTeacherGuidanceAssig('0'); }
        }
      }
    }
  }

  public renderFooterButtons = () => (
    <div className="modalContentTGAssig__footer__aligLeft">
      <CreateButton
        title={intl.get('generals.save')}
        onClick={this.closeModalTG}
        green={true}
      >
        {intl.get('generals.save')}
      </CreateButton>
    </div>
  )
  public handleDownloadAsPDF = async () => {
    const { readOnly, newAssignmentStore, drafAssignment, currentQuestionaryStore } = this.props;
    let downloadWait = 2000;
    if (readOnly) downloadWait = 0;

    const btnDownload = document.getElementById('btnDownloadPDFTP');
    btnDownload!.setAttribute('disabled', 'true');
    btnDownload!.classList.add('downloading');
    btnDownload!.firstChild!.textContent = `${intl.get('generals.downloading')} ...`;

    setTimeout(
      async () => {
        if (readOnly) {
          if (currentQuestionaryStore!.assignment !== null) {
            await currentQuestionaryStore!.downloadTeacherGuidancePDF(currentQuestionaryStore!.assignment.id);
          }
        } else {
          await newAssignmentStore!.downloadTeacherGuidancePDF(drafAssignment!.id);
        }
        btnDownload!.removeAttribute('disabled');
        btnDownload!.classList.remove('downloading');
        btnDownload!.firstChild!.textContent = intl.get('teacherGuidance.download_pdf');
      },
      downloadWait
    );
  }
  public renderQuestions = () => {
    const { readOnly, drafAssignment, currentQuestionaryStore } = this.props;

    if (readOnly) {
      if (currentQuestionaryStore!.assignment !== null) {
        return currentQuestionaryStore!.assignment!.questions.map((item, index) => (
          <div className={'modalContentTG__body__row line'} key={index}>
            <h4>
              <div className="nestedOrderNumber">{item.orderPosition + 1}</div>
              {item.title === intl.get('new assignment.Enter a question') ? '' : item.title}
            </h4>
            <DescriptionEditor
              description={item.guidance}
              readOnly={readOnly}
            />
          </div>
        ));
      }
    } else {
      return drafAssignment!.questions.map((item, index) => (
          <div className={'modalContentTG__body__row line'} key={index}>
            <h4>
              <div className="nestedOrderNumber">{item.orderPosition + 1}</div>
              {item.title === intl.get('new assignment.Enter a question') ? '' : item.title}
            </h4>
            <DescriptionEditor
              className={`jr-desEdit${item.orderPosition + 1}`}
              description={item.guidance}
              readOnly={readOnly}
              onChange={(value: string) => { item.setGuidance(value); }}
            />
          </div>
        )
      );
    }
  }

  public renderAssigGuidance = () => {
    const { readOnly, drafAssignment, currentQuestionaryStore, newAssignmentStore } = this.props;

    if (readOnly) {
      if (currentQuestionaryStore!.assignment !== null) {
        return (
          <div className="modalContentTGAssig__body__row first">
            <DescriptionEditor
              className="jr-desEdit0"
              description={currentQuestionaryStore!.assignment!.guidance}
              readOnly={readOnly}
            />
          </div>
        );
      }
    } else {
      newAssignmentStore!.setTitleButtonGuidance(drafAssignment!);

      return (
        <div className="modalContentTGAssig__body__row first">
          <DescriptionEditor
            className="jr-desEdit0"
            description={drafAssignment!.guidance}
            readOnly={readOnly}
            onChange={(value: string) => { drafAssignment!.setGuidance(value); }}
          />
        </div>
      );
    }
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
            {this.renderAssigGuidance()}
            {this.renderQuestions()}
          </div>
          <div className="modalContentTGAssig__footer">
          {readOnly !== true && this.renderFooterButtons()}
            <div className="modalContentTGAssig__footer__aligRight">
              <button id="btnDownloadPDFTP" onClick={this.handleDownloadAsPDF}>
                {intl.get('teacherGuidance.download_pdf')}
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
