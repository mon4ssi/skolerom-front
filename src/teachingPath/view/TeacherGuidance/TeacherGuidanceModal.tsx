import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import 'teachingPath/view/TeacherGuidance/TeacherGuidanceModal.scss';
import downloadImg from 'assets/images/download.svg';
import teaGuiBGImg from 'assets/images/guidance-bg.svg';
import openTGImg from 'assets/images/open.svg';
import { EditTeachingPathStore } from 'teachingPath/view/EditTeachingPath/EditTeachingPathStore';
import { Link } from 'react-router-dom';
import { TeachingPathNodeType } from 'teachingPath/TeachingPath';
import { CreateButton } from 'components/common/CreateButton/CreateButton';

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
    currentEntity.handleOpenTeacherGuidance(nroLevel);
  }

  public closeModalTG = () => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTG') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.remove('open');
    modalTGBack[0].classList.add('hide');
  }

  public renderFirstNode = () => {
    const { currentEntity, readOnly } = this.props;
    const titleTG = currentEntity.content.selectQuestion;

    const hasAssignmenet = (currentEntity.content.children.length > 0 && currentEntity.content.children[0].type === TeachingPathNodeType.Assignment);
    let itemTG: Teacherguidance | null = null;

    if (hasAssignmenet) {
      itemTG = {
        nroLevel: 1,
        nroLetter: 1,
        hideBorderTop: false,
        nroChild: currentEntity.content.children.length,
        children: currentEntity.content,
        hasAssignmenet: true
      };
    }

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
          {hasAssignmenet && <div className="contentAssigments">{this.getContentAssignment(itemTG!)}</div>}
        </div>
      );
    }
  }

  public getContentAssignment = (itemTG: Teacherguidance) => {
    const countChildren = itemTG.children.children.length;
    if (countChildren > 0) {
      if (itemTG.children.children[0].type ===  TeachingPathNodeType.Assignment) {
        const listItemAssignment: Array<any> = [];
        itemTG.children.children.forEach((child) => {
          if (child) {
            child.items!.forEach((item) => {
              listItemAssignment.push(item);
            });
          }
        });

        return listItemAssignment!.map((itemAssignment: any, index) => (
          <Link key={index} to={`/assignments/view/${itemAssignment.value.id}?preview${itemAssignment.value.hasGuidance ? '&open=tg' : ''}`} target="_blank">
            {itemAssignment.value.hasGuidance ? `${itemAssignment.value.title} — ${intl.get('teacherGuidance.name')}` : `${itemAssignment.value.title} — (${intl.get('teacherGuidance.noAdded')})`}
            {itemAssignment.value.hasGuidance ? <img src={openTGImg} alt={intl.get('teacherGuidance.nane')} /> : ''}
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
      if (children) {
        children.forEach((item) => {
          if (item && item.children.length > 0) {
            if (item.children) {
              item.children.forEach((child) => {
                if (child) {
                  if (child.children.length > 0) {
                    childrenTmp.push(child);
                  }
                }
              });
            }

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
      }
      nroLevelLoop += 1;
      nroLetterLoop = firstLetterNumber;
      hideBorderTopLoop = true;
      continueLoop = (nroNodes > 0);
    }

    return childrenFinal.map((item, index) => (
            <div className={`modalContentTG__body__row ${item.hideBorderTop ? 'line' : ''}`} key={index}>
              <h4>
                <div className="nestedOrderNumber">{item.nroLevel}</div>
                {item.children.selectQuestion} {item.nroChild > 1 ? `(${intl.get('teacherGuidance.option')} ${String.fromCharCode(item.nroLetter)})` : ''}
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
        title={intl.get('generals.save')}
        onClick={this.closeModalTG}
        green={true}
      >
        {intl.get('generals.save')}
      </CreateButton>
    </div>
  )

  public handleDownloadAsPDF = async () => {
    const { editTeachingPathStore, currentEntity, readOnly } = this.props;
    let downloadWait = 2000;
    if (readOnly) downloadWait = 0;

    const btnDownload = document.getElementById('btnDownloadPDFTP');
    btnDownload!.setAttribute('disabled', 'true');
    btnDownload!.classList.add('downloading');
    btnDownload!.firstChild!.textContent = `${intl.get('generals.downloading')} ...`;

    setTimeout(
      async () => {
        await editTeachingPathStore!.downloadTeacherGuidancePDF(currentEntity.id);
        btnDownload!.removeAttribute('disabled');
        btnDownload!.classList.remove('downloading');
        btnDownload!.firstChild!.textContent = intl.get('teacherGuidance.download_pdf');
      },
      downloadWait
    );
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
            <div className="modalContentTG__header__close" onClick={this.closeModalTG}>
              <svg width="31" height="30" viewBox="0 0 31 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path className="roundedCircle" fill-rule="evenodd" clip-rule="evenodd" d="M15.2476 0.9375C23.0138 0.9375 29.3101 7.23375 29.3101 15C29.3101 22.7663 23.0138 29.0625 15.2476 29.0625C7.48131 29.0625 1.18506 22.7663 1.18506 15C1.18506 7.23375 7.48131 0.9375 15.2476 0.9375Z" stroke="#0B2541" fill="white" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.62256 20.625L20.8713 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M20.8726 20.625L9.62134 9.375" stroke="#0B2541" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
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
              <button id="btnDownloadPDFTP" onClick={this.handleDownloadAsPDF}>
                {intl.get('teacherGuidance.download_pdf')}
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
