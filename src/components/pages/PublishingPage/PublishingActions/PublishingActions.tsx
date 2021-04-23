import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import classnames from 'classnames';

import { NewAssignmentStore } from 'assignment/view/NewAssignment/NewAssignmentStore';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { Subject, Grade } from 'assignment/Assignment';
import tagsImg from 'assets/images/tags.svg';
import gradeImg from 'assets/images/grade.svg';
import settingsImg from 'assets/images/settings-slider.svg';
import visibilityImg from 'assets/images/visibility.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';
import publicIconImg from 'assets/images/teacher-public.svg';
import privateIconImg from 'assets/images/private.svg';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

import { TagInputComponent, TagProp } from 'components/common/TagInput/TagInput';
import { firstLevel, secondLevel, studentLevels } from 'utils/constants';

import './PublishingActions.scss';

interface Props {
  store?: NewAssignmentStore | EditTeachingPathStore;
}

@observer
export class PublishingActions extends Component<Props> {

  public componentDidMount() {
    const { store } = this.props;
    if (!store!.getAllGrades().length) {
      store!.getGrades();

    }
    if (!store!.getAllSubjects().length) {
      store!.getSubjects();
    }
  }

  public subjectToTagProp = (subject: Subject): TagProp => ({
    id: subject.id,
    title: subject.title,
  })

  public addSubject = (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);

    if (subject) {
      store!.currentEntity!.addSubject(subject);
    }
  }

  public removeSubject = (id: number) => {
    const { store } = this.props;
    const subject = store!.getAllSubjects().find(subject => subject.id === id);

    if (subject) {
      store!.currentEntity!.removeSubject(subject);
    }
  }

  public gradeToTagProp = (grade: Grade): TagProp => ({
    id: grade.id,
    title: grade.title,
  })

  public addGrade = (id: number) => {
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);

    if (grade) {
      store!.currentEntity!.addGrade(grade);
    }
  }

  public handleSelectLevel = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { currentEntity } = this.props.store!;

    e.preventDefault();

    if (
      currentEntity!.levels.length > 1 ||
      (currentEntity!.levels.length === 1 && !currentEntity!.levels.includes(Number(e.currentTarget.value)))
    ) {
      currentEntity!.setLevels(Number(e.currentTarget.value));
    }
  }

  public removeGrade = (id: number) => {
    const { store } = this.props;
    const grade = store!.getAllGrades().find(grade => grade.id === id);

    if (grade) {
      store!.currentEntity!.removeGrade(grade);
    }
  }

  public handlePrivateOn = () => {
    this.props.store!.currentEntity!.setIsPrivate(true);
  }

  public handlePrivateOff = async () => {

    const isCopy = this.props.store!.currentEntity!.isCopy;
    const assignmentTitle = this.props.store!.currentEntity!.title;
    if (
      isCopy && (
      /Copy$/.test(assignmentTitle) ||
      /Kopi$/.test(assignmentTitle) ||
      /copy$/.test(assignmentTitle) ||
      /kopi$/.test(assignmentTitle))
    ) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: intl.get('new assignment.copy_title_not_allow')
      });

      return;
    }

    this.props.store!.currentEntity!.setIsPrivate(false);
  }

  public renderSubjectInput = () => {
    const { store } = this.props;

    const subjects = store!.getAllSubjects().map(this.subjectToTagProp);
    const selectedSubjects = store!.currentEntity!.getListOfSubjects().map(this.subjectToTagProp);

    return (
      <div className="flexBox dirColumn w50 subject">
        <div className="flexBox">
          <img src={tagsImg} alt="Subjects" title="Subjects"/>
          <div className={'title'}>{intl.get('publishing_page.subject')}</div>
        </div>

        <TagInputComponent
          dataid="renderSubjectInput"
          className="filterBy darkTheme"
          tags={subjects}
          addTag={this.addSubject}
          currentTags={selectedSubjects}
          removeTag={this.removeSubject}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderGradeInput = () => {
    const { store } = this.props;
    const { currentEntity } = store!;

    const grades = store!.getAllGrades().map(this.gradeToTagProp).sort((a, b) => a.id - b.id);
    const selectedGrades = currentEntity!.getListOfGrades().map(this.gradeToTagProp);

    return (
      <div className="flexBox dirColumn w50 grade">
        <div className="flexBox">
          <img src={gradeImg} alt={intl.get('generals.grade')} title={intl.get('generals.grade')} />
          <div className={'title'}>{intl.get('publishing_page.grade')}</div>
        </div>

        <TagInputComponent
          dataid="renderGradeInput"
          className="filterBy darkTheme"
          tags={grades}
          addTag={this.addGrade}
          currentTags={selectedGrades}
          removeTag={this.removeGrade}
          listView
          temporaryTagsArray
        />
      </div>
    );
  }

  public renderLevelButton = (level: number) => {
    const { levels } = this.props.store!.currentEntity!;

    const buttonClassName = levels.includes(level) ? 'active' : undefined;
    const levelIcon = level === firstLevel ? firstLevelImg :
      level === secondLevel ? secondLevelImg :
      thirdLevelImg;

    return (
      <button
        key={`key-${level}`}
        value={level}
        className={buttonClassName}
        onClick={this.handleSelectLevel}
      >
        <img src={levelIcon} alt={`${level}-level-icon`} />
        {level}
      </button>
    );
  }

  public renderLevelChoice = () => (
    <div className="flexBox dirColumn w50 levels">
      <div className="flexBox">
        <img src={settingsImg} alt={intl.get('generals.student_level')} title={intl.get('generals.student_level')} />
        <div className={'title'}>{intl.get('publishing_page.student_level')}</div>
      </div>

      <div className="studentLevelButtons flexBox">

      {studentLevels.map(this.renderLevelButton)}
      </div>
    </div>
  )

  public renderVisibility = () => {
    const { store } = this.props;

    const privateButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: store!.currentEntity!.isPrivate,
      }
    );

    const publicButtonClassnames = classnames(
      'flexBox justifyCenter alignCenter w50',
      {
        active: !store!.currentEntity!.isPrivate,
      }
    );

    return (
      <div className="flexBox dirColumn w50 visibility">
        <div className="flexBox">
          <img src={visibilityImg} alt={intl.get('generals.visibility')} title={intl.get('generals.visibility')} />
          <div className={'title'}>{intl.get('publishing_page.visibility')}</div>
        </div>

        <div className="visibilityButtons flexBox">
          <button
            className={publicButtonClassnames}
            onClick={this.handlePrivateOff}
          >
            <img
              src={publicIconImg}
              alt="Public"
            />
            {intl.get('publishing_page.public')}
          </button>

          <button
            className={privateButtonClassnames}
            onClick={this.handlePrivateOn}
          >
            <img
              src={privateIconImg}
              alt="Private"
            />
            {intl.get('publishing_page.private')}
          </button>
        </div>
      </div>
    );
  }

  public render() {
    return (
      <div className="PublishingActions flexBox dirColumn">
        <div className="infoContainer flexBox spaceBetween">

          {this.renderSubjectInput()}

          {this.renderGradeInput()}

        </div>

        <div className="infoContainer flexBox spaceBetween">

          {this.renderLevelChoice()}

          {this.renderVisibility()}

        </div>

      </div>

    );
  }
}
