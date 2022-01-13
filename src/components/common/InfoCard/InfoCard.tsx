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
import placeholderDomainImg from 'assets/images/addLink_placeholder.png';
import refresh from 'assets/images/refresh.svg';

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
  url?: string;
  urldomain?: string;
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
  onCLickImg?(url?: string): void;
  onDelete?(itemId: number): void;
  onEdit?(itemId: number, type: string): void;
  setActiveTooltip?(): void;
  deleteTeachingPath?(): void;
  copyTeachingPath?(id: number): void;
}

class InfoCardComponent extends Component<Props & RouteComponentProps> {

  private handleClickDelete = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onDelete!(this.props.id!);
  }

  public handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onEdit!(this.props.id!, this.props.type!);
  }

  public renderGrade = (grade: Grade) => {
    if (grade.title) {
      const title = grade.title.split('.', 1);
      return (
        <div key={grade.id}>
          {title}{intl.get('new assignment.indicadorgrade')}
        </div>
      );
    }
  }

  public renderActionButtons = () => (
    <div className="actionButtons flexBox">
      {/* <img src={dragImg} alt="drag" /> */}
      <div className="actionButtonsItem refreshButtonsItem">
        <button onClick={this.handleEditClick} title={intl.get('generals.edit')}>
          <img
            src={refresh}
            alt={intl.get('generals.edit')}
            title={intl.get('generals.edit')}
          />
        </button>
      </div>
      <div className="actionButtonsItem">
        <button onClick={this.handleClickDelete} title={intl.get('generals.delete')}>
          <img
            src={trashImg}
            alt={intl.get('generals.delete')}
            title={intl.get('generals.delete')}
          />
        </button>
      </div>
    </div>
  )

  public renderDomainButtons = () => (
    <div className="actionButtons flexBox">
      {/* <img src={dragImg} alt="drag" /> */}
      <div className="actionButtonsItem refreshButtonsItem">
        <button onClick={this.handleEditClick} title={intl.get('generals.edit')}>
          <img
            src={refresh}
            alt={intl.get('generals.edit')}
            title={intl.get('generals.edit')}
          />
        </button>
      </div>
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
        <div className="flexBox gradesLine">
          <div className="flexBox gradesLineInside">
            {visibleGrades}
          </div>
          <p>{intl.get('new assignment.grade')}</p>
        </div>
      );
    }
    return null;
  }

  public onCardImgClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const { onCLickImg, url } = this.props;
    event.preventDefault();
    if (onCLickImg) {
      onCLickImg(url);
    }
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

  public targetRouteDomain = () => {
    const { urldomain } = this.props;
    window.open(`${urldomain}`, '_blank');
  }

  public renderRouteDomain = () => {
    const { urldomain, type } = this.props;
    if (type === 'DOMAIN') {
      let pathLink = urldomain!.split('//')[1].split('/')[0];
      if (pathLink.split('www.').length > 1) {
        pathLink = pathLink.split('www.')[1];
      }
      return (
        <a href="javascript:void(0)" onClick={this.targetRouteDomain} title={urldomain}>
          {pathLink}
        </a>
      );
    }
    return (
      <p>{intl.get(`spanicon.${type}`)}</p>
    );
  }

  public renderDefaultIcons = () => {
    const { levels, icon, type } = this.props;
    if (type === 'DOMAIN') {
      return (
        <div className="defaultIcons flexBox">
          <div className="flexBox">
            <img src={icon} className={`tpIcon tpIcon-${type}`} alt="info-icon" onClick={this.targetRouteDomain}/>
            <span>{this.renderRouteDomain()}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="defaultIcons flexBox">
        <div className="flexBox">
          <img src={icon} className={`tpIcon tpIcon-${type}`} alt="info-icon"/>
          <span>{this.renderRouteDomain()}</span>
        </div>
      </div>
    );
  }

  public renderTeachingPathIcons = () => {
    const { idActiveCard, id, withTooltip } = this.props;

    const tooltipImageSrc = (!isNull(idActiveCard) && idActiveCard === id) ? moreHover : more;

    return (
      <div className={`withTooltip AbsolutePosition ${!withTooltip && 'withoutTooltip'}`}>
        {/* this.renderDefaultIcons() */}
        {withTooltip && <button className="OptionMsj" data-msj={intl.get('activity_page.options')} onClick={this.handleTooltipVisible} ><img src={tooltipImageSrc} alt="info-icon" /></button>}
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
    const { title, img, withButtons, onClick, isTeachingPath, withTooltip, type } = this.props;
    const isDomain = type === 'DOMAIN' ? true : false;
    const placeholderImgDefault = type === 'DOMAIN' ? placeholderDomainImg : placeholderImg;
    const infoCardClassNames = classnames(
      'InfoCard flexBox dirColumn',
      onClick && 'cursorPointer'
    );
    return (
      <div className={infoCardClassNames} onClick={this.onCardClick} data-id={this.props.id}>
        {!isDomain && withButtons && this.renderActionButtons()}
        {isDomain && withButtons && this.renderDomainButtons()}
        <button title={title}>
          <img src={img || placeholderImgDefault} alt={title} title={title} className="cardImage" onClick={this.onCardImgClick}/>
        </button>
        <div className="cardInfo flexBox dirColumn spaceBetween">
          <div>
            {!isTeachingPath && this.renderDefaultIcons()}
            <div className={`${!withTooltip && 'flexBox'}`}>
              <div className="cardTitle">
                <p className={`${!title && 'noTitle'}`}>{title ? title : intl.get('edit_teaching_path.no_title')}</p>
              </div>
              {isTeachingPath && this.renderTeachingPathIcons()}
            </div>

            {this.renderDescription()}
          </div>
          <div className="footerCardInfo flexBox">
            {/* this.renderGrades() */}
            {this.renderNumberOfQuestions()}
          </div>
        </div>
      </div>
    );
  }
}

export const InfoCard = withRouter(InfoCardComponent);
