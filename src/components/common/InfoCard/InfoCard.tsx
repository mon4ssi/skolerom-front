import React, { Component, SyntheticEvent, createRef } from 'react';
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
import drag from 'assets/images/drag.svg';
import dragActive from 'assets/images/drag-active.svg';
import arrowLeftRounded from 'assets/images/arrow-left-rounded.svg';

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
  isTestAccount?: boolean;
  ownedByMe?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  isReadArticle?: boolean;
  hiddeIcons?: boolean;
  canEditOrDelete?: boolean;
  onClick?(id: number, view?: string): void;
  onCLickImg?(url?: string): void;
  onDelete?(itemId: number): void;
  onEdit?(itemId: number, type: string): void;
  onDrag?(itemId: number, type: string): void;
  onCancelDrag?(itemId: number, type: string): void;
  setActiveTooltip?(): void;
  deleteTeachingPath?(): void;
  copyTeachingPath?(id: number): void;
}

interface State {
  showdescription: boolean;
}

class InfoCardComponent extends Component<Props & RouteComponentProps, State> {
  public buttonref = React.createRef<HTMLButtonElement>();
  public state = {
    showdescription: false,
  };

  private handleClickDelete = (event: React.SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onDelete!(this.props.id!);
  }

  public handleEditClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onEdit!(this.props.id!, this.props.type!);
  }

  public activeDragClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onDrag!(this.props.id!, this.props.type!);
  }

  public desactiveDragClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    this.props.onCancelDrag!(this.props.id!, this.props.type!);
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
      <div className="actionButtonsItem dragButtonsItem">
        <button onClick={this.activeDragClick} title={intl.get('edit_teaching_path.nodes.drag_drop_element')} className="activeDragButton">
          <img
            src={drag}
            alt={intl.get('edit_teaching_path.nodes.drag_drop_element')}
            title={intl.get('edit_teaching_path.nodes.drag_drop_element')}
          />
        </button>
        <button onClick={this.desactiveDragClick} title={intl.get('edit_teaching_path.nodes.drag_drop_element')} className="desactiveDragButton">
          <img
            src={dragActive}
            alt={intl.get('edit_teaching_path.nodes.drag_drop_element')}
            title={intl.get('edit_teaching_path.nodes.drag_drop_element')}
          />
        </button>
      </div>
      <div className="actionButtonsItem refreshButtonsItem">
        <button onClick={this.handleEditClick} title={intl.get('edit_teaching_path.nodes.change_element')}>
          <img
            src={refresh}
            alt={intl.get('edit_teaching_path.nodes.change_element')}
            title={intl.get('edit_teaching_path.nodes.change_element')}
          />
        </button>
      </div>
      <div className="actionButtonsItem">
        <button onClick={this.handleClickDelete} title={intl.get('edit_teaching_path.nodes.delete_element')}>
          <img
            src={trashImg}
            alt={intl.get('edit_teaching_path.nodes.delete_element')}
            title={intl.get('edit_teaching_path.nodes.delete_element')}
          />
        </button>
      </div>
    </div>
  )

  public renderDomainButtons = () => (
    <div className="actionButtons flexBox">
      <div className="actionButtonsItem dragButtonsItem">
        <button onClick={this.activeDragClick} title={intl.get('edit_teaching_path.nodes.drag_drop_element')} className="activeDragButton">
          <img
            src={drag}
            alt={intl.get('edit_teaching_path.nodes.drag_drop_element')}
            title={intl.get('edit_teaching_path.nodes.drag_drop_element')}
          />
        </button>
        <button onClick={this.desactiveDragClick} title={intl.get('edit_teaching_path.nodes.drag_drop_element')} className="desactiveDragButton">
          <img
            src={dragActive}
            alt={intl.get('edit_teaching_path.nodes.drag_drop_element')}
            title={intl.get('edit_teaching_path.nodes.drag_drop_element')}
          />
        </button>
      </div>
      <div className="actionButtonsItem refreshButtonsItem">
        <button onClick={this.handleEditClick} title={intl.get('edit_teaching_path.nodes.change_element')}>
          <img
            src={refresh}
            alt={intl.get('edit_teaching_path.nodes.change_element')}
            title={intl.get('edit_teaching_path.nodes.change_element')}
          />
        </button>
      </div>
      <div className="actionButtonsItem">
        <button onClick={this.handleClickDelete} title={intl.get('edit_teaching_path.nodes.delete_element')}>
          <img
            src={trashImg}
            alt={intl.get('edit_teaching_path.nodes.delete_element')}
            title={intl.get('edit_teaching_path.nodes.delete_element')}
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

  public onCardImgClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

  public onButtonCardClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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
        <a href="#" onClick={this.targetRouteDomain} title={urldomain}>
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
            <img src={icon} className={`tpIcon tpIcon-${type}`} alt="info-icon" onClick={this.targetRouteDomain} />
            <span>{this.renderRouteDomain()}</span>
          </div>
        </div>
      );
    }
    return (
      <div className="defaultIcons flexBox">
        <div className="flexBox">
          <img src={icon} className={`tpIcon tpIcon-${type}`} alt="info-icon" />
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
      isTestAccount={this.props.isTestAccount!}
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
      canEditOrDelete={this.props.canEditOrDelete}
    />
  )

  public preventViewCard = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public toggleRead = () => {
    if (this.state.showdescription) {
      this.setState({ showdescription: false });
    } else {
      this.setState({ showdescription: true });
    }
  }

  public renderDescription = () => {
    const { description, hiddeIcons } = this.props;
    const classDescription = (this.state.showdescription) ? 'cardDescription active' : 'cardDescription';
    const ClassButton = (this.state.showdescription) ? 'toggleRead active' : 'toggleRead';
    const textButton = (this.state.showdescription) ? intl.get('preview.teaching_path.read close') : intl.get('preview.teaching_path.read open');
    if (hiddeIcons) {
      return description ? (
        <div className="ContentcardDescription">
          <div className={classDescription}>
            {description}
          </div>
          <div className="toggleReadDescription">
            <a href="#" className={ClassButton} onClick={this.toggleRead}>
              <img src={arrowLeftRounded} />
              <p>{textButton}</p>
            </a>
          </div>
        </div>
      ) : null;
    }
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

  public isErrorImg = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = placeholderImg;
  }

  public render() {
    const { title, img, withButtons, onClick, isTeachingPath, isPublished, withTooltip, type } = this.props;
    const isDomain = type === 'DOMAIN' ? true : false;
    const placeholderImgDefault = type === 'DOMAIN' ? placeholderDomainImg : placeholderImg;
    const displayDraftNotation = isPublished === undefined || (isPublished !== null && isPublished !== undefined && isPublished);
    const infoCardClassNames = classnames(
      'InfoCard flexBox dirColumn',
      onClick && 'cursorPointer'
    );
    const classIsRead = (this.props.isReadArticle) ? 'btn btnRead' : 'btn';
    const textsRead = (this.props.isReadArticle) ? intl.get('preview.teaching_path.read again') : intl.get('preview.teaching_path.read article');
    const textsDomain = (this.props.isReadArticle) ? intl.get('preview.teaching_path.read again') : intl.get('preview.teaching_path.read external');
    const textsAssig = (this.props.isReadArticle) ? intl.get('preview.assignment.read again') : intl.get('preview.assignment.read article');
    const textFinal = (this.props.type === 'ASSIGNMENT') ? textsAssig : (this.props.type === 'DOMAIN') ? textsDomain : textsRead;
    if (this.props.hiddeIcons) {
      return (
        <div className={infoCardClassNames} data-id={this.props.id}>
          {!isDomain && withButtons && this.renderActionButtons()}
          {isDomain && withButtons && this.renderDomainButtons()}
          <button title={title} onClick={this.onButtonCardClick} ref={this.buttonref}>
            <img src={img || placeholderImgDefault} alt={title} title={title} className="cardImage" onError={this.isErrorImg} />
          </button>
          <div className="cardInfo flexBox dirColumn spaceBetween">
            <div>
              {!isTeachingPath && !this.props.hiddeIcons && this.renderDefaultIcons()}
              <div className={`${!withTooltip && 'flexBox'}`}>
                <div className="cardTitle">
                  <p className={`${!title && 'noTitle'}`}>{title ? title : intl.get('edit_teaching_path.no_title')}<span className="isDraft">{displayDraftNotation ? '' : `- ${intl.get('teaching_paths_list.Draft')}`}</span></p>
                </div>
                {isTeachingPath && this.renderTeachingPathIcons()}
              </div>

              {this.renderDescription()}
              <div className="buttonRead">
                <button className={classIsRead} onClick={this.onButtonCardClick}>
                  {textFinal}
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className={infoCardClassNames} onClick={this.onCardClick} data-id={this.props.id}>
        {!isDomain && withButtons && this.renderActionButtons()}
        {isDomain && withButtons && this.renderDomainButtons()}
        <button title={title} onClick={this.onCardImgClick} >
          <img src={img || placeholderImgDefault} alt={title} title={title} className="cardImage" />
        </button>
        <div className="cardInfo flexBox dirColumn spaceBetween">
          <div>
            {!isTeachingPath && !this.props.hiddeIcons && this.renderDefaultIcons()}
            <div className={`${!withTooltip && 'flexBox'}`}>
              <div className="cardTitle">
                <p className={`${!title && 'noTitle'}`}>{title ? title : intl.get('edit_teaching_path.no_title')}<span className="isDraft">{displayDraftNotation ? '' : `- ${intl.get('teaching_paths_list.Draft')}`}</span></p>
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
