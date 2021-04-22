import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import classnames from 'classnames';
import isNull from 'lodash/isNull';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Grade } from 'assignment/Assignment';
import { secondLevel, thirdLevel } from 'utils/constants';
import { getStudentLevelsRange } from 'utils/studentLevelsRange';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { TeachingPathTooltip } from './TeachingPathTooltip';

import trashImg from 'assets/images/trash-tp.svg';
import more from 'assets/images/hovered-more.svg';
import moreHover from 'assets/images/more.svg';
import firstLevelImg from 'assets/images/level-1-blue.svg';
import secondLevelImg from 'assets/images/level-2-blue.svg';
import thirdLevelImg from 'assets/images/level-3-blue.svg';
import placeholderImg from 'assets/images/list-placeholder.svg';

import './InfoCard.scss';

const twoGrades = 2;
const threeGrades = 3;

interface Props {
  withTooltip?: boolean;
  withButtons?: boolean;
  type?: string;
  id?: number;
  icon: string;
  title: string;
  description?: string;
  img?: string;
  grades?: Array<Grade>;
  numberOfQuestions?: number;
  levels?: Array<number>;
  view?: string;
  idActiveCard?: number | null;
  isTeachingPath?: boolean;
  isContentManager?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  onClick?(id: number, view?: string): void;
  onDelete?(itemId: number): void;
  setActiveTooltip?(): void;
  deleteTeachingPath?(): void;
  copyTeachingPath?(id: number): void;
}

class InfoCardComponent extends Component<Props & RouteComponentProps> {

  private handleClickDelete = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onDelete!(this.props.id!);
  }

  public renderGrade = (grade: Grade) => {
    if (grade.title) {
      const title = grade.title.split('.', 1);
      return (
        <div key={grade.id}>
          {title}{intl.get('new assignment.grade')}
        </div>
      );
    }
  }

  public renderActionButtons = () => (
    <div className="actionButtons flexBox">
      {/* <img src={dragImg} alt="drag" /> */}
      <button onClick={this.handleClickDelete}>
        <img
          src={trashImg}
          alt="trash"
        />
      </button>
    </div>
  )

  public renderGrades = () => {
    const { grades } = this.props;
    const amountOfGrades = grades ? grades.length : 0;
    if (amountOfGrades > 0) {
      const visibleGrades = grades!
        .slice(0, amountOfGrades === threeGrades ? threeGrades : twoGrades)
        .map(this.renderGrade);

      return (
        <div className="flexBox grades">
          {visibleGrades}
          {amountOfGrades > twoGrades && amountOfGrades !== threeGrades && <div>{intl.get('assignment list.Others')}</div>}
        </div>
      );
    }
    return null;
  }

  public onCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { id, onClick, view } = this.props;
    event.preventDefault();
    if (onClick) {
      onClick(id!, view);
    }
  }

  public renderNumberOfQuestions = () => {
    const { numberOfQuestions, type } = this.props;

    const intlParams = {
      numberOfQuestions,
      ending: numberOfQuestions === 1 ? '' : 's'
    };

    return type === 'ASSIGNMENT' && (
      <div className="numberOfQuestions">
        {intl.get('publishing_page.number_of_question', intlParams)}
      </div>
    );
  }

  public handleTooltipVisible = (e: SyntheticEvent) => {
    e.stopPropagation();
    this.props.setActiveTooltip!();
  }

  public renderLevel = (levels: Array<number>) => {
    const levelImage = levels.includes(thirdLevel) ? thirdLevelImg :
      levels.includes(secondLevel) ? secondLevelImg :
        firstLevelImg;

    return (
      <div className="levels flexBox">
        <img
          src={levelImage}
          alt="levels"
          className="levelIcon"
        />
        {getStudentLevelsRange(levels!)}
      </div>
    );
  }

  public renderDefaultIcons = () => {
    const { levels, icon } = this.props;

    return (
      <div className="defaultIcons flexBox">
        <div className="flexBox">
          {levels && levels.length ? this.renderLevel(levels) : null}
          <img src={icon} className="tpIcon" alt="info-icon"/>
        </div>
        {this.renderNumberOfQuestions()}
      </div>
    );
  }

  public renderTeachingPathIcons = () => {
    const { idActiveCard, id, withTooltip } = this.props;

    const tooltipImageSrc = (!isNull(idActiveCard) && idActiveCard === id) ? moreHover : more;

    return (
      <div className={`withTooltip ${!withTooltip && 'withoutTooltip'}`}>
        {this.renderDefaultIcons()}
        {withTooltip && <span className="OptionMsj" data-msj={intl.get('activity_page.options')}><img src={tooltipImageSrc} alt="info-icon" onClick={this.handleTooltipVisible} /></span>}
        {(!isNull(idActiveCard) && idActiveCard === id) && this.renderTooltip()}
      </div>
    );
  }

  public renderTooltip = () => (
    <TeachingPathTooltip
      preventViewCard={this.preventViewCard}
      deleteTeachingPath={this.deleteTeachingPath}
      viewTeachingPath={this.viewTeachingPath}
      editTeachingPath={this.onCardClick}
      copyTeachingPath={this.handleCopyTeachingPath}
      viewAnswers={this.viewAnswers}
      handleTooltipVisible={this.handleTooltipVisible}
      outsideClickIgnoreClass={'withTooltip'}
      view={this.props.view}
      isContentManager={this.props.isContentManager}
      isPublished={this.props.isPublished}
      isDistributed={this.props.isDistributed}
    />
  )

  public preventViewCard = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public renderDescription = () => {
    const { description } = this.props;

    return description ? (
      <div className="cardDescription">
        {description}
      </div>
    ) : null;
  }

  public deleteTeachingPath = async (e: SyntheticEvent) => {
    const confirm = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.delete')
    });

    if (confirm) {
      this.props.deleteTeachingPath!();
    }
  }

  public viewTeachingPath = (e: SyntheticEvent) => {
    const { history, id } = this.props;
    history.push(`/teaching-paths/view/${id}`, {
      readOnly: true
    });
    this.handleTooltipVisible(e);
  }

  public handleCopyTeachingPath = async (e: SyntheticEvent) => {
    const { id, copyTeachingPath } = this.props;

    const isCopyApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.copy')
    });

    if (isCopyApproved) {
      copyTeachingPath!(id!);
    }
  }

  public viewAnswers = (e: SyntheticEvent) => {
    const { history, id } = this.props;

    history.push(`/teaching-paths/answers/${id}`);
  }

  public render() {
    const { title, img, withButtons, onClick, isTeachingPath, withTooltip } = this.props;

    const infoCardClassNames = classnames(
      'InfoCard flexBox dirColumn',
      onClick && 'cursorPointer'
    );

    return (
      <div className={infoCardClassNames} onClick={this.onCardClick}>
        {withButtons && this.renderActionButtons()}
        <button>
          <img src={img || placeholderImg} alt="info-background" className="cardImage"/>
        </button>
        <div className="cardInfo flexBox dirColumn spaceBetween">
          <div>
            <div className={`${!withTooltip && 'flexBox'}`}>
              <div className="cardTitle">
                <p className={`${!title && 'noTitle'}`}>{title ? title : intl.get('edit_teaching_path.no_title')}</p>
              </div>

              {isTeachingPath && this.renderTeachingPathIcons()}
            </div>

            {!isTeachingPath && this.renderDefaultIcons()}

            {this.renderDescription()}
          </div>

          {this.renderGrades()}
        </div>
      </div>
    );
  }
}

export const InfoCard = withRouter(InfoCardComponent);
