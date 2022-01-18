import React, { Component, createRef } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import './TeacherguidanceModal.scss';
import { CreateButton } from '../CreateButton/CreateButton';
import closeImg from 'assets/images/modal-close.svg';
import downloadImg from 'assets/images/download.svg';
import teaGuiBGImg from 'assets/images/guidance-bg.svg';
import openTGImg from 'assets/images/open.svg';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { Link } from 'react-router-dom';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { checkIfStateModificationsAreAllowed } from 'mobx/lib/internal';
import { TeachingPathsListStore } from 'teachingPath/view/TeachingPathsList/TeachingPathsListStore';
import clone from 'lodash/clone';

interface Props {
  editTeachingPathStore?: EditTeachingPathStore;
  currentEntity: DraftTeachingPath;
  readOnly?: boolean;
}

interface Teacherguidance {
  nroLevel: number;
  nroLetter: number;
  hideBorderTop: boolean;
  nroChild: number;
  children: EditableTeachingPathNode;
  hasAssignmenet: boolean;
}

@inject('editTeachingPathStore')
@observer
export class TeacherguidanceModal extends Component<Props> {
  public static contextType = ItemContentTypeContext;

  public openModalTG = (nroLevel: string) => {
    const { currentEntity } = this.props;
    currentEntity.handleOpenTeachingGuidance(nroLevel);
  }

  public closeModalTG = () => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTG') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.remove('open');
    modalTGBack[0].classList.add('hide');
  }

  public renderFirstNode = () => {
    const { currentEntity, readOnly } = this.props;
    let titleTG = currentEntity.content.selectQuestion;
    if (titleTG === intl.get('edit_teaching_path.title.title_placeholder')) { titleTG = ''; }

    if (currentEntity.content.children.length > 0) {
      return (
        <div className="modalContentTG__body__row line">
          <h4>
            <div className="nestedOrderNumber">1</div>
            {titleTG}
          </h4>
          <DescriptionEditor
            className="jr-desEdit1a"
            description={currentEntity.content.guidance}
            readOnly={readOnly}
            onChange={(value: string) => { currentEntity.content.setGuidance(value); }}
          />
        </div>
      );
    }
  }
  public getContentAssignment = (itemTG: Teacherguidance) => {
    const { currentEntity, editTeachingPathStore } = this.props;
    const countChildren = itemTG.children.children.length;
    if (countChildren > 0) {
      if (itemTG.children.children[0].type ===  TeachingPathNodeType.Assignment) {
        return itemTG.children.children.map((itemAssignment, index) => (
          <Link key={index} to={`/assignments/view/${itemAssignment.items![0].value.id}?preview`} target="_blank" className="flexBox alignCenter">
            {itemAssignment.items![0].value.title} - ({intl.get('teacherGuidance.noAdded')})
          </Link>
        ));
      }
    } else {
      return null;
    }
  }

  public renderChildrenNode = () => {
    const { currentEntity, readOnly } = this.props;
    let nroLevelLoop: number = 2;
    const firstLetterNumber: number = 97;

    const childrenFinal: Array<Teacherguidance> = [];
    let children: Array<EditableTeachingPathNode> = [];
    let childrenTmp: Array<EditableTeachingPathNode> = currentEntity.content.children;
    let nroNodes: number = 0;
    let nroLetterLoop: number = firstLetterNumber;
    let hideBorderTopLoop: boolean = true;
    let continueLoop = true;

    while (continueLoop) {
      nroNodes = 0;
      children = childrenTmp;
      childrenTmp = [];

      children.forEach((item) => {
        if (item.children.length > 0) {
          item.children.forEach((child) => {
            if (child.children.length > 0) {
              childrenTmp.push(child);
            }
          });

          const child:Teacherguidance = {
            nroLevel: nroLevelLoop,
            nroLetter: nroLetterLoop,
            hideBorderTop: hideBorderTopLoop,
            nroChild: children.length,
            children: item,
            hasAssignmenet: (item.children.length > 0 && item.children[0].type === TeachingPathNodeType.Assignment)
          };

          childrenFinal.push(child);
          nroLetterLoop += 1;
          nroNodes += 1;
          hideBorderTopLoop = false;
        }
      });

      nroLevelLoop += 1;
      nroLetterLoop = firstLetterNumber;
      hideBorderTopLoop = true;
      continueLoop = (nroNodes > 0);
    }

    return childrenFinal.map((item, index) => (
            <div className={`modalContentTG__body__row ${item.hideBorderTop ? 'line' : ''}`} key={index}>
              <h4>
                <div className="nestedOrderNumber">{item.nroLevel}</div>
                {item.children.selectQuestion === intl.get('edit_teaching_path.title.title_placeholder') ? '' : item.children.selectQuestion} {item.nroChild > 1 ? `(${intl.get('teacherGuidance.option')} ${String.fromCharCode(item.nroLetter)})` : ''}
              </h4>
              <DescriptionEditor
                className={`jr-desEdit${item.nroLevel}${String.fromCharCode(item.nroLetter)}`}
                description={item.children.guidance}
                readOnly={readOnly}
                onChange={(value: string) => { item.children.setGuidance(value); }}
              />
              {item.hasAssignmenet && <div className="contentAssigments">{this.getContentAssignment(item)}</div>}
            </div>
          )
        );
  }

  public renderButtonTeacherguidance = () => {
    const { readOnly, currentEntity } = this.props;
    const nroChildren: number = currentEntity.content.children.length;
    let titleButton = intl.get('teacherGuidance.buttons.edit');
    if (nroChildren === 0) titleButton = intl.get('teacherGuidance.buttons.add');
    if (readOnly === true) titleButton = intl.get('teacherGuidance.buttons.read');
    const showButton: boolean = (((readOnly === true && currentEntity.hasGuidance) || (!readOnly)));

    return (
      <div className="btnTeacherguide">
        {showButton && <CreateButton className="buttonTeacherGuide" title={titleButton} onClick={this.openModalTG.bind(this, '0')}><img src={teaGuiBGImg} alt={titleButton} /> {titleButton}</CreateButton>}
        <div className={`horizontalLine ${!showButton ? 'withOutButton' : ''}`} />
      </div>
    );
  }

  public renderFooterButtons = () => (
    <div className="modalContentTG__footer__aligLeft">
      <CreateButton
        title={intl.get('notifications.cancel')}
        onClick={this.closeModalTG}
        pink={true}
      >
        {intl.get('notifications.cancel')}
      </CreateButton>
      &nbsp;
      <CreateButton
        title={intl.get('teacherGuidance.save_and_close')}
        onClick={this.closeModalTG}
        green={true}
      >
        {intl.get('teacherGuidance.save_and_close')}
      </CreateButton>
    </div>
  )
  public handleDownloadAsPDF = () => {
    const { editTeachingPathStore, currentEntity } = this.props;
    editTeachingPathStore!.downloadTeacherGuidancePDF(currentEntity.id);
  }

  public render() {
    const { currentEntity, readOnly } = this.props;

    const nroChildren: number = currentEntity.content.children.length;
    let titleTG = intl.get('teacherGuidance.titleEdit');
    let titleTGSub = intl.get('teacherGuidance.titleSub');

    if (nroChildren === 0) titleTG = intl.get('teacherGuidance.titleAdd');
    if (readOnly === true) {
      titleTG = intl.get('teacherGuidance.titleRead');
      titleTGSub = intl.get('teacherGuidance.titleSubRead');
    }

    return (
      <div>
        {this.renderButtonTeacherguidance()}
        <div className="modalContentTG">
          <div className="modalContentTG__header">
            <h1>{titleTG}</h1>
            <span>{titleTGSub}</span>
            <div className="modalContentTG__header__close">
              <img
                src={closeImg}
                alt={intl.get('generals.close')}
                title={intl.get('generals.close')}
                onClick={this.closeModalTG}
              />
            </div>
          </div>
          <div className="modalContentTG__body">
            <div className="modalContentTG__body__row first">
              <DescriptionEditor
                className="jr-desEdit0"
                description={currentEntity.guidance}
                readOnly={readOnly}
                onChange={(value: string) => { currentEntity.setGuidance(value); }}
              />
            </div>
            {this.renderFirstNode()}
            {this.renderChildrenNode()}
          </div>
          <div className="modalContentTG__footer">
            {readOnly !== true && this.renderFooterButtons()}
            <div className="modalContentTG__footer__aligRight">
              <button onClick={this.handleDownloadAsPDF}>
                <span>{intl.get('teacherGuidance.download_pdf')}</span>
                <img src={downloadImg} />
              </button>
            </div>
          </div>
        </div>
        <div className="modalContentTGBackground hide">&nbsp;</div>
      </div>
    );
  }
}
