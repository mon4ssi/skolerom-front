import React, { Component } from 'react';
import intl from 'react-intl-universal';
import classNames from 'classnames';
import moment from 'moment';
import { Link } from 'react-router-dom';

import { AssignmentDistribute as AssignmentDistributeClass } from 'assignment/Assignment';

import clockDark from 'assets/images/clock-dark.svg';
import clockGray from 'assets/images/clock-gray.svg';
import leaf from 'assets/images/leaf-white.svg';

import './AssignmentDistribute.scss';
import { UIStore } from 'locales/UIStore';
import { inject, observer } from 'mobx-react';

interface Props {
  distribute: AssignmentDistributeClass;
  uiStore?: UIStore;
}

@inject('uiStore')
@observer
export class AssignmentDistribute extends Component<Props> {
  private getDeadlineLabel(): string {
    const { distribute } = this.props;
    const locale = localStorage.getItem('currentLocale')!;

    const dueDate = moment(moment().subtract(1, 'd')).locale(locale).to(moment(distribute.deadline), true);
    const isPassed = moment(moment(distribute.deadline)).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD');

    return isPassed ?
      intl.get('answers.past') :
      `${intl.get('answers.Due in')} ${dueDate}`;
  }

  private getQuestionsLabel() {
    const { distribute } = this.props;
    const questionLabel = distribute.questionsCount === 1
      ? intl.get('evaluation_page.question')
      : intl.get('evaluation_page.questions');

    return `${distribute.questionsCount} ${questionLabel}`;
  }

  private renderSubjects() {
    const { distribute } = this.props;
    if (distribute.subjects.length) {
      return (
        <div className="AssignmentDistribute__subjects fw300">
          <div className="AssignmentDistribute__textBlock AssignmentDistribute__subject">
            {distribute.subjects[0].title}
          </div>
          {this.renderSecondSubjectIfPossible()}
          {this.renderOthersBadgeIfNeeded()}
          {this.renderMobileOthersBadgeIfNeeded()}
        </div>
      );
    }
  }

  private renderSecondSubjectIfPossible() {
    const { distribute } = this.props;
    const subject = distribute.subjects[1];
    if (subject) {
      return (
        <div className="AssignmentDistribute__textBlock AssignmentDistribute__subject AssignmentDistribute__subject_desktop">
          {subject.title}
        </div>
      );
    }
  }

  private renderMobileOthersBadgeIfNeeded() {
    const { distribute } = this.props;
    // tslint:disable-next-line:no-magic-numbers
    const subject = distribute.subjects[1];
    if (subject) {
      return (
        <div className="AssignmentDistribute__textBlock AssignmentDistribute__subject AssignmentDistribute__subject_mobile">
          {intl.get('evaluation_page.Others')}
        </div>
      );
    }
  }

  private renderOthersBadgeIfNeeded() {
    const { distribute } = this.props;
    // tslint:disable-next-line:no-magic-numbers
    const subject = distribute.subjects[2];
    if (subject) {
      return (
        <div className="AssignmentDistribute__textBlock AssignmentDistribute__subject AssignmentDistribute__subject_desktop">
          {intl.get('evaluation_page.Others')}
        </div>
      );
    }
  }

  public setTab = () => {
    this.props.uiStore!.setCurrentActiveTab('assignments');
  }

  public render(): React.ReactNode {
    const { distribute } = this.props;

    const studentsLabel = distribute.totalDistributes === 1
      ? intl.get('evaluation_page.student')
      : intl.get('evaluation_page.students');

    const isDeadlinePassed = distribute.deadline.diff(moment()) <= 0;

    const deadlineTextClasses = classNames('AssignmentDistribute__deadlineText AssignmentDistribute__textBlock', {
      AssignmentDistribute__deadlineText_passed: isDeadlinePassed,
    });

    const imageClasses = classNames('AssignmentDistribute__image', {
      AssignmentDistribute__image_fullSize: distribute.image,
    });

    return (
      <Link to={`/assignments/answers/${distribute.id}`} onClick={this.setTab}>
        <div className="AssignmentDistribute">
          <div className="AssignmentDistribute__block AssignmentDistribute__blockTop">
            <div className="AssignmentDistribute__imageContainer">
              <img src={distribute.image || leaf} alt="distribute-img" className={imageClasses}/>
            </div>
            <div className="AssignmentDistribute__textBlock AssignmentDistribute__title">{distribute.title}</div>
            <div className="AssignmentDistribute__textBlock AssignmentDistribute__questions AssignmentDistribute__questions_mobile">
              {this.getQuestionsLabel()}
            </div>
            {this.renderSubjects()}
          </div>
          <div className="AssignmentDistribute__block AssignmentDistribute__blockBottom">
            <div className="AssignmentDistribute__deadline">
              <div className={deadlineTextClasses}>{this.getDeadlineLabel()}</div>
              <img src={isDeadlinePassed ? clockGray : clockDark} alt="" className="AssignmentDistribute__deadlineImage"/>
            </div>
            <div className="AssignmentDistribute__textBlock AssignmentDistribute__questions">{this.getQuestionsLabel()}</div>
            <div className="AssignmentDistribute__textBlock AssignmentDistribute__students">
              {distribute.answeredDistributes} {intl.get('evaluation_page.of')} {distribute.totalDistributes} {studentsLabel}
            </div>
          </div>
        </div>
    </Link>
    );
  }
}
