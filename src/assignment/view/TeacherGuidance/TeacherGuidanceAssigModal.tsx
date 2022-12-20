import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';

import closeImg from 'assets/images/close-rounded-black.svg';
import downloadImg from 'assets/images/download.svg';

import { DescriptionEditor } from '../NewAssignment/Questions/DescriptionEditor';
import { CreateButton } from 'components/common/CreateButton/CreateButton';

import 'assignment/view/TeacherGuidance/TeacherGuidanceAssigModal.scss';

import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { NewAssignmentStore } from '../NewAssignment/NewAssignmentStore';
import { CurrentQuestionaryStore } from '../CurrentAssignmentPage/CurrentQuestionaryStore';
import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';

interface Props {
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: CurrentQuestionaryStore;
  readOnly?: boolean;
  openGuidance?: boolean;
}

interface State {
  showdescription: boolean;
}

@inject('newAssignmentStore')
@observer
export class TeacherGuidanceAssigModal extends Component<Props, State> {
  public state = {
    showdescription: false,
  };
  public closeModalTG = () => {
    /* const modalTG = Array.from(document.getElementsByClassName('modalContentTGAssig') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGAssigBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.remove('open');
    modalTGBack[0].classList.add('hide'); */
    const { readOnly, currentQuestionaryStore, newAssignmentStore, openGuidance } = this.props;
    newAssignmentStore!.closeModalTG();
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

  public toggleRead = () => {
    if (this.state.showdescription) {
      this.setState({ showdescription: false });
    } else {
      this.setState({ showdescription: true });
    }
  }

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
    const ClassButton = (this.state.showdescription) ? 'toggleRead active' : 'toggleRead';
    const expandedDiv = (this.state.showdescription) ? 'expansion full' : 'expansion';
    const expandedparagraph = (this.state.showdescription) ? 'paragraph full' : 'paragraph';
    if (readOnly) {
      if (currentQuestionaryStore!.assignment !== null) {
        return currentQuestionaryStore!.assignment!.questions.map((item, index) => (
          <div className={'modalContentTG__body__row line'} key={index}>
            <h4>
              <div className="nestedOrderNumber">{item.orderPosition + 1}</div>
              {item.title === intl.get('new assignment.Enter a question') ? '' : item.title}
            </h4>
            <div style={{ display: 'flex' }}>
              <div>
                {item.content.map(item => <div key={item.text!} dangerouslySetInnerHTML={{ __html: item.text! }} />)}
              </div>
              <div>
                {'o'}
              </div>
            </div>
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
          <div className={expandedDiv}>
            <div className={expandedparagraph}>
              {item.content.map(item => <div key={item.text!} dangerouslySetInnerHTML={{ __html: item.text! }} />)}
            </div>
            <a href="javascript:void(0)" className={ClassButton} onClick={this.toggleRead}><img src={arrowLeftRounded} alt="arrowLeftRounded" /></a>
          </div>
          <DescriptionEditor
            className={`jr-desEdit${item.orderPosition + 1}`}
            description={item.guidance}
            readOnly={readOnly}
            onChange={(value: string) => { item.setGuidance(value); }}
          />
        </div>
      ));
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
            <div className="modalContentTGAssig__header__close" onClick={this.closeModalTG}>
              <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="roundedCircle" fill-rule="evenodd" clip-rule="evenodd" d="M15.2476 0.9375C23.0138 0.9375 29.3101 7.23375 29.3101 15C29.3101 22.7663 23.0138 29.0625 15.2476 29.0625C7.48131 29.0625 1.18506 22.7663 1.18506 15C1.18506 7.23375 7.48131 0.9375 15.2476 0.9375Z" stroke="#0B2541" fill="white" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9.62256 20.625L20.8713 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M20.8726 20.625L9.62134 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
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
