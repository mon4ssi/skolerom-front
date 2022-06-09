import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { EvaluationLabel } from 'components/common/EvaluationLabel/EvaluationLabel';
import { AssignmentListStore } from 'assignment/view/AssignmentsList/AssignmentListStore';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import { Assignment } from 'assignment/Assignment';

import { deadlineDateFormat } from 'utils/constants';

import clock from 'assets/images/clock.svg';
import bg from 'assets/images/bg-default.svg';
import question from 'assets/images/questions.svg';
import close from 'assets/images/close.svg';
import user from 'assets/images/user-placeholder.png';

import './SideOutPanelPreview.scss';
import { TeachingPath, TeachingPathRepo, TEACHING_PATH_REPO } from 'teachingPath/TeachingPath';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { TeachingPathApi } from 'teachingPath/api';

interface Props {
  store?: AssignmentListStore | TeachingPathsListStore;
  onClose?(e: SyntheticEvent): void;
}

interface SideOutPanelPreviewState {
  currentTeachingPath: undefined | TeachingPath;
}

export const USER_SERVICE = 'TEACHING_PATH_SERVICE';

@observer
class SideOutPanelPreviewComponent extends Component<Props & RouteComponentProps, SideOutPanelPreviewState> {
  private teachingPathService: TeachingPathService = injector.get(TEACHING_PATH_SERVICE);

  public state = {
    currentTeachingPath: undefined,
  };

  private onClose = (e: SyntheticEvent) => {
    if (this.props.onClose) {
      this.props.onClose(e);
    }
  }

  public componentDidMount = async() => {
    const { currentEntity } = this.props.store!;
    const {  } = this.state;
    const { store } = this.props;
    /* const response = await this.teachingPathService.getTeachingPathDataById(id);
    console.log(response); */
    /* console.log(currentEntity); */
  }

  public answerEntity = () => {
    const { currentEntity, currentEntityTypeRoute } = this.props.store!;

    this.props.history.push({
      pathname: `/${currentEntityTypeRoute}/${currentEntity!.id}`,
      state: {
        readOnly: false
      }
    });
  }

  public viewEvaluation = () => {
    const { currentEntity: { title, id, answerId }, currentEntityTypeRoute } = this.props.store!;
    this.props.history.push({
      pathname: `/${currentEntityTypeRoute}s/${id}/answer/${answerId}/evaluation`,
      state: {
        title
      }
    });
  }

  public stopPropagation = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public render() {
    const { currentEntity } = this.props.store!;
    const
      {
        featuredImage,
        title,
        comment,
        mark,
        isPassed,
        description,
        grades,
        deadline,
        status,
        author,
        isAnswered
      } = currentEntity;
    const isPassedDeadline = moment(deadline).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');
    const disableViewButton = (!isAnswered && isPassedDeadline) || !isPassedDeadline;
    const { currentEntity: { id }, currentEntityTypeRoute } = this.props.store!;
    /* const response = await this.teachingPathService.getTeachingPathDataById(id);
    console.log(response); */

    const numberOfParts = currentEntity instanceof Assignment ?
      currentEntity!.numberOfQuestions :
      currentEntity!.numberOfSteps.max!;

    const stepsOrQuestionsTitle = currentEntity instanceof Assignment ?
      (numberOfParts > 1 ? intl.get('answers.questions') : intl.get('answers.question')) :
      (numberOfParts > 1 ? intl.get('answers.steps') : intl.get('answers.step'));

    const buttonTitle = currentEntity instanceof Assignment ?
      intl.get('answers.answer_assignment') :
      intl.get('answers.answer_teaching_path');

    const view = currentEntity instanceof Assignment ? 'View assignment' : 'View teaching path';
    const guidance = currentEntity instanceof Assignment ? 'Teacher guidance' : 'Teacher guidance';
    const edit = currentEntity instanceof Assignment ? 'Edit assignment' : 'Edit teaching path';
    const duplicate = currentEntity instanceof Assignment ? 'Duplicate' : 'Duplicate';

    return (
      <div className={'evaluationInfo'} onClick={this.stopPropagation} tabIndex={0}>
        <div className="contentContainer">
          <div className="close-panel">
            <img
              src={close}
              alt="close"
              className="close-button"
              onClick={this.onClose}
            />
          </div>
          <div className={'headerPanel'}>
            <div className="imageBlock">
              <div className={'shadow'}/>
            {/* <img src={featuredImage ? featuredImage : bg} alt="img" className={'imagePlaceholder'}/> */}
            </div>
            <div className={'subjectInfo'}>
              {/* <div className={'subject'}>6A | History</div> */}
              <div className={'entityTitle'}>{title}</div>
              <div className={'infoTeacher'}>
                {/* <img className={'userPhoto'} src={user} alt="user"/> */}
                <span className={'name'}>{author}</span>
                {/* <span className={'lesson'}>6A/History</span> */}
              </div>
            </div>
          </div>
          <div id="aux1" className="hidden">Not name</div>
          <input type="text" aria-labelledby="aux1" autoFocus className="hidden"/>
          <div className="entityInfo">
            <div className="partsInfo">
              <img src={question} alt="question" />
              {numberOfParts} {stepsOrQuestionsTitle} <span className={'name'}>{author}</span>
            </div>
            <div className={`deadline ${isPassedDeadline && 'passed'}`}>
              <img src={clock} alt="clock"/>
              {isPassedDeadline ? intl.get('answers.past') : `${intl.get('answers.Due')} ${moment(deadline).format(deadlineDateFormat)}`}
            </div>
          </div>
          <div className="entityInfo">

            <div className="partsInfo">
              {description}
            </div>
          </div>

          <div className="summary">
            <span>{intl.get('answers.summary')}</span>

            <EvaluationLabel isPassed={isPassed} mark={mark} status={status} />

            <div className="commentToEntity">
              {comment ? comment : `${author} ${intl.get('answers.not comment')}`}
            </div>

            <div className={'view'}>
              <CreateButton disabled={disableViewButton} green onClick={this.viewEvaluation} title={intl.get('answers.view')}>
                {intl.get('answers.view')}
              </CreateButton>
            </div>
          </div>
        </div>

        <div className={'answerButton'}>
          <CreateButton disabled={isPassedDeadline} onClick={this.answerEntity} title={view} >
            {view}
          </CreateButton>
          <CreateButton disabled={isPassedDeadline} onClick={this.answerEntity} title={guidance} >
            {guidance}
          </CreateButton>
          <CreateButton disabled={isPassedDeadline} onClick={this.answerEntity} title={edit} >
            {edit}
          </CreateButton>
          <CreateButton disabled={isPassedDeadline} onClick={this.answerEntity} title={duplicate} >
            {duplicate}
          </CreateButton>
        </div>
      </div>
    );
  }
}

export const SideOutPanelPreview = withRouter(SideOutPanelPreviewComponent);
