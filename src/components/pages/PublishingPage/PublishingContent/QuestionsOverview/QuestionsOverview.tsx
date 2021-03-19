import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { Grade, Subject } from 'assignment/Assignment';
import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

import './QuestionsOverview.scss';
import { EditEntityLocaleKeys } from 'utils/enums';

interface Props {
  currentEntity?: DraftAssignment | DraftTeachingPath;
  localeKey: string;
}

@observer
export class QuestionsOverview extends Component<Props> {

  public renderQuestion = (title: string, index: number) => (
    <div className="question flexBox alignCenter" key={`question-${index}`}>
      <div className="questionNumber flexBox alignCenter justifyCenter">{index + 1}</div>
      <p className={'fs15 fw300'}>{title}</p>
    </div>
  )

  public renderQuestions = () => {
    const { currentEntity } = this.props;

    const questionsTitles = [
      ...(currentEntity as DraftAssignment)!.questions.map(question => question.title),
      intl.get('publishing_page.review_and_submit')
    ];

    return (
      <>
        <p className="title">
          {intl.get('publishing_page.questions_overview')}
        </p>

        <div className="questions">
          {questionsTitles.map(this.renderQuestion)}
        </div>
      </>
    );
  }

  public renderGradeSubject = (item: Grade | Subject) => (
    <div
      className="gradeSubject flexBox justifyCenter alignCenter fw500"
      key={`${item.id}-${item.title}`}
    >
      {item.title}
    </div>
  )

  public render() {
    const { currentEntity, localeKey } = this.props;

    return (
      <div className="QuestionsOverview flexBox dirColumn">

        {localeKey === EditEntityLocaleKeys.NEW_ASSIGNMENT && this.renderQuestions()}

        <div className="gradesSubjectsContainer">
          <p className="title">
            {intl.get('publishing_page.grade')}
          </p>
          <div className="gradesSubjects flexBox">
            {currentEntity!.grades.map(this.renderGradeSubject)}
          </div>
        </div>

        <div className="gradesSubjectsContainer">
          <p className="title">
          {intl.get('publishing_page.subject')}
          </p>
          <div className="gradesSubjects flexBox">
            {currentEntity!.subjects.map(this.renderGradeSubject)}
          </div>
        </div>
      </div>
    );
  }
}
