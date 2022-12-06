import React, { Component, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import intl from 'react-intl-universal';
import isNull from 'lodash/isNull';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { CurrentQuestionaryStore } from 'assignment/view/CurrentAssignmentPage/CurrentQuestionaryStore';
import { CreateButton } from 'components/common/CreateButton/CreateButton';
import detailModalImg from 'assets/images/goals-white.svg';
import subject from 'assets/images/tags.svg';
import coreElement from 'assets/images/core.svg';
import multiSubject from 'assets/images/cogs.svg';
import source from 'assets/images/voice.svg';
import goals from 'assets/images/goals.svg';

import './DetailsModal.scss';

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  currentEntityTeachingPath?: DraftTeachingPath;
  newAssignmentStore?: NewAssignmentStore;
  drafAssignment?: DraftAssignment;
  currentQuestionaryStore?: CurrentQuestionaryStore;
}

interface State {
  isOpen: boolean;
}

@inject('questionaryTeachingPathStore')
@inject('newAssignmentStore')
@observer

export class DetailsModal extends Component<Props, State> {
  public state = {
    isOpen: false,
  };
  public openModalDetail = () => {
    this.setState({ isOpen: true });
  }
  public closeModalDetail = () => {
    this.setState({ isOpen: false });
  }
  public buttonOpenDetailsModal = () => {
    const { isOpen } = this.state;
    return (
      <CreateButton title={intl.get('generals.viewdetails')} onClick={this.openModalDetail}>
        <img src={detailModalImg} alt={intl.get('generals.viewdetails')} />
        {intl.get('generals.viewdetails')}
       </CreateButton>
    );
  }
  public subjectRender = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={subject} /> {intl.get('preview.teaching_path.grep.subjects')}</h3>
        <ul className="modalContentTG__body__list">
          <li>Norks</li>
          <li>Naturfag</li>
          <li>Samfunnsfag</li>
        </ul>
      </div>
    );
  }
  public coreElementsRender = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={coreElement} /> {intl.get('preview.teaching_path.grep.core_elements')}</h3>
        <ul className="modalContentTG__body__list">
          <li>Undring og utforsking</li>
          <li>Perspektivmangfald og samfunnskritisk tenking</li>
          <li>Identitet og livsmeistring</li>
        </ul>
      </div>
    );
  }
  public multiSubjectsRender = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={multiSubject} /> {intl.get('preview.teaching_path.grep.multidisciplinary_subjects')}</h3>
        <ul className="modalContentTG__body__list">
          <li>Demokrati og medborgerskap</li>
          <li>Folkehelse og livsmestring</li>
        </ul>
      </div>
    );
  }
  public sourcesRender = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={source} /> {intl.get('preview.teaching_path.grep.sources')}</h3>
        <ul className="modalContentTG__body__list">
          <li>Lærergenerert innhold</li>
        </ul>
      </div>
    );
  }
  public goalsRender = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG__body__item">
        <h3><img className="imgInfo" src={goals} /> {intl.get('preview.teaching_path.grep.educational_goals')}</h3>
        <ul className="modalContentTG__body__listGoals">
          <li>
            <div className="grade">7. trim</div>
            <div className="description">tforske og presentere dagsaktuelle tema eller debatter ved å bruke samfunnsfaglege metodar, kjelder og digitale ressursar, og ar</div>
          </li>
          <li>
            <div className="grade">7. trim</div>
            <div className="description">tforske og presentere dagsaktuelle tema eller debatter ved å bruke samfunnsfaglege metodar, kjelder og digitale ressursar, og ar</div>
          </li>
        </ul>
      </div>
    );
  }
  public contentDetailModal = () => {
    const { isOpen } = this.state;
    return (
      <div className="modalContentTG open">
        <div className="modalContentTG__header">
          <h1>{intl.get('generals.viewdetails_title')}</h1>
          <div className="modalContentTG__header__close" onClick={this.closeModalDetail}>
            <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path className="roundedCircle" fill-rule="evenodd" clip-rule="evenodd" d="M15.2476 0.9375C23.0138 0.9375 29.3101 7.23375 29.3101 15C29.3101 22.7663 23.0138 29.0625 15.2476 29.0625C7.48131 29.0625 1.18506 22.7663 1.18506 15C1.18506 7.23375 7.48131 0.9375 15.2476 0.9375Z" stroke="#0B2541" fill="white" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9.62256 20.625L20.8713 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M20.8726 20.625L9.62134 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div className="modalContentTG__body">
            {this.subjectRender()}
            {this.coreElementsRender()}
            {this.multiSubjectsRender()}
            {this.sourcesRender()}
            {this.goalsRender()}
        </div>
    </div>
    );
  }
  public backgroundDetailModal = () => {
    const { isOpen } = this.state;
    return (
        <div className="modalContentTGBackground" onClick={this.closeModalDetail}/>
    );
  }
  public render() {
    return (
        <div className="detailsModal">
            {this.buttonOpenDetailsModal()}
            {this.state.isOpen && this.contentDetailModal()}
            {this.state.isOpen && this.backgroundDetailModal()}
        </div>
    );
  }
}
