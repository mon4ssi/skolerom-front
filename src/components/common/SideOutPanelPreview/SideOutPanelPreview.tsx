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

import { deadlineDateFormat, thirdLevel } from 'utils/constants';

import clock from 'assets/images/clock.svg';
import close from 'assets/images/close.svg';

import question from 'assets/images/questions.svg';
/* import articles from 'assets/images'; */
/* import user from 'assets/images/user-placeholder.png'; */
/* import calendar from 'assets/images/user-placeholder.png'; */
import subject from 'assets/images/tags.svg';
import coreElement from 'assets/images/core.svg';
import multiSubject from 'assets/images/cogs.svg';
import source from 'assets/images/voice.svg';
import goals from 'assets/images/goals.svg';

import './SideOutPanelPreview.scss';
import { TeachingPath, TeachingPathRepo, TEACHING_PATH_REPO } from 'teachingPath/TeachingPath';
import { injector } from 'Injector';
import { TeachingPathService, TEACHING_PATH_SERVICE } from 'teachingPath/service';
import { TeachingPathApi } from 'teachingPath/api';
import { UserType } from 'user/User';
import { Notification, NotificationTypes } from '../Notification/Notification';

interface Props extends RouteComponentProps {
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

  public componentDidMount = async () => {
    const { currentEntity } = this.props.store!;
    const { } = this.state;
    const { store } = this.props;
    const { currentEntity: { id }, currentEntityTypeRoute } = this.props.store!;
    const response = await this.teachingPathService.getTeachingPathDataById(id);
    const responseType = response!.hasGuidance;
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

  public handleCopy = async () => {
    const { history } = this.props;
    const { currentEntity: { id } } = this.props.store!;
    const { currentEntity } = this.props.store!;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      /* const currentEntityRoute = entityStore instanceof AssignmentListStore ? 'assignments' : 'teaching-paths'; */
      const copyId = await this.teachingPathService.copyTeachingPath(id!);
      history.push(`/teaching-paths/edit/${copyId}`);
    }
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
        isPublished,
        grades,
        deadline,
        status,
        author,
        isAnswered
      } = currentEntity;
    const isPassedDeadline = moment(deadline).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');
    const disableViewButton = (!isAnswered && isPassedDeadline) || !isPassedDeadline;
    const { currentEntity: { id }, currentEntityTypeRoute } = this.props.store!;

    const { history } = this.props;

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
      <div className={'previewModalInfo'} onClick={this.stopPropagation} tabIndex={0}>
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
              <div className={'shadow'} />
              {/* <img src={featuredImage ? featuredImage : bg} alt="img" className={'imagePlaceholder'}/> */}
            </div>
            <div className={'subjectInfo'}>
              <div className={'entityTitle'}>{title}</div>
            </div>
          </div>
          <div id="aux1" className="hidden">Not name</div>
          <input type="text" aria-labelledby="aux1" autoFocus className="hidden" />
          <div className="entityInfo">
            <div className="partsInfo">
              <img src={question} alt="question" />
              13 questions <span className={'name'}>{author}</span>
            </div>
            <div className="partsInfo">
              <img src={question} alt="question" />
              3 articles <span className={'name'}>{author}</span>
            </div>
            <div className="partsInfo">
              <img src={question} alt="question" />
              By Kari Nordmann <span className={'name'}>{author}</span>
            </div>
            <div className={`deadline ${isPassedDeadline && 'passed'}`}>
              <img src={clock} alt="clock" />
              {isPassedDeadline ? intl.get('answers.past') : `${intl.get('answers.Due')} ${moment(deadline).format(deadlineDateFormat)}`}
            </div>
          </div>
          <div className="entityDescription">

            <div className="partsInfo">
              {/* {description} */}
              Bli med på innsiden av kroppens immunsystem – ditt eget fantastiske forsvarsverk som holder deg frisk og rask.
            </div>
          </div>

          <div className="summary">

            <div className="entityInfoBlock">
              <div className="image">
                <img className="imgInfo" src={subject} />
              </div>
              <div>
                <div className="title">{'Subject'}</div>
                <div>
                  <ul className="listItem">
                    <li className="item">
                      {'Science'}
                    </li>
                    <li className="item">
                      {'Health'}
                    </li>
                    <li className="item">
                      {'Mathematics'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="entityInfoBlock">
              <div className="image">
                <img className="imgInfo" src={coreElement} />
              </div>
              <div>
                <div className="title">{'Core Element'}</div>
                <div>
                  <ul className="listItem">
                    <li className="item">
                      {'Naturvitenskapelige praksiser og tenkemåter'}
                    </li>
                    <li className="item">
                      {'Test med 7 stk'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="entityInfoBlock">
              <div className="image">
                <img className="imgInfo" src={multiSubject} />
              </div>
              <div>
                <div className="title">{'Multidisciplinary subjects'}</div>
                <div>
                  <ul className="listItem">
                    <li className="item">
                      {'Bærekraftig utvikling'}
                    </li>
                    <li className="item">
                      {'Demokrati og medborgerskap'}
                    </li>
                  </ul>
                </div>
              </div>

            </div>
            <div className="entityInfoBlock">
              <div className="image">
                <img className="imgInfo" src={source} />
              </div>
              <div>
                <div className="title">{'Source'}</div>
                <div>
                  <ul className="listItem">
                    <li className="item">
                      {'Hjernelæring'}
                    </li>
                    <li className="item">
                      {'RS Sjøredningsskolen'}
                    </li>
                  </ul>
                </div>
              </div>

            </div>
            <div className="entityInfoBlock">
              <div className="image">
                <img className="imgInfo" src={goals} />
              </div>
              <div className="title">{'Educational goals'}</div>
            </div>
          </div>
        </div>

        <div className="footerButtons">
          <div className="actionButton">
            <CreateButton disabled={!isPublished} onClick={() => { history.push(`/teaching-paths/view/${id}`); }} title={view} >
              {view}
            </CreateButton>
          </div>
          <div className="actionButton">
            <CreateButton disabled={isPassedDeadline} onClick={this.answerEntity} title={guidance} >
              {guidance}
            </CreateButton>
          </div>
          <div className="actionButton">
            <CreateButton disabled={false} onClick={() => { history.push(`/teaching-paths/edit/${id}`); }} title={edit} >
              {edit}
            </CreateButton>
          </div>
          <div className="actionButton">
            <CreateButton disabled={isPassedDeadline} onClick={this.handleCopy} title={duplicate} >
              {duplicate}
            </CreateButton>
          </div>
        </div>
      </div>
    );
  }
}

export const SideOutPanelPreview = withRouter(SideOutPanelPreviewComponent);
