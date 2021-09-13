import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import moment from 'moment';
import { observer } from 'mobx-react';
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

import './SideOutPanel.scss';

interface Props {
  store?: AssignmentListStore | TeachingPathsListStore;
  onClose?(e: SyntheticEvent): void;
}

@observer
class SideOutPanelComponent extends Component<Props & RouteComponentProps> {

  private onClose = (e: SyntheticEvent) => {
    if (this.props.onClose) {
      this.props.onClose(e);
    }
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
        deadline,
        status,
        author,
        isAnswered
      } = currentEntity;
    const isPassedDeadline = moment(deadline).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');
    const disableViewButton = (!isAnswered && isPassedDeadline) || !isPassedDeadline;

    const numberOfParts = currentEntity instanceof Assignment ?
      currentEntity!.numberOfQuestions :
      currentEntity!.numberOfSteps.max!;

    const stepsOrQuestionsTitle = currentEntity instanceof Assignment ?
      (numberOfParts > 1 ? intl.get('answers.questions') : intl.get('answers.question')) :
      (numberOfParts > 1 ? intl.get('answers.steps') : intl.get('answers.step'));

    const buttonTitle = currentEntity instanceof Assignment ?
      intl.get('answers.answer_assignment') :
      intl.get('answers.answer_teaching_path');

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
            <img src={featuredImage ? featuredImage : bg} alt="img" className={'imagePlaceholder'}/>
            </div>
            <div className={'subjectInfo'}>
              {/* <div className={'subject'}>6A | History</div> */}
              <div className={'entityTitle'}>{title}</div>
              <div className={'infoTeacher'}>
                <img className={'userPhoto'} src={user} alt="user"/>
                <span className={'name'}>{author}</span>
                {/* <span className={'lesson'}>6A/History</span> */}
              </div>
            </div>
          </div>
          <div id="aux1" className="hidden">Not name</div>
          <input type="text" aria-labelledby="aux1" autoFocus className="hidden"/>
          <div className="entityInfo">
            <div className={`deadline ${isPassedDeadline && 'passed'}`}>
              <img src={clock} alt="clock"/>
              {isPassedDeadline ? intl.get('answers.past') : `${intl.get('answers.Due')} ${moment(deadline).format(deadlineDateFormat)}`}
            </div>
            <div className="partsInfo">
              <img src={question} alt="question" />
              {numberOfParts} {stepsOrQuestionsTitle}
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
          <CreateButton  onClick={this.answerEntity} title={buttonTitle} >
            {buttonTitle}
          </CreateButton>
        </div>
      </div>
    );
  }
}

export const SideOutPanel = withRouter(SideOutPanelComponent);
