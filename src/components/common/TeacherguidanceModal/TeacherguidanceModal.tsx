import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';
import { DraftTeachingPath, EditableTeachingPathNode } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import './TeacherguidanceModal.scss';
import { CreateButton } from '../CreateButton/CreateButton';
import closeImg from 'assets/images/modal-close.svg';
import downloadImg from 'assets/images/download.svg';

interface Props {
  currentEntity: DraftTeachingPath;
}

interface Teacherguidance {
  nroLevel: number;
  nroLetter: number;
  hideBorderTop: boolean;
  nroChild: number;
  children: EditableTeachingPathNode;
}

@inject('editTeachingPathStore')
@observer
export class TeacherguidanceModal extends Component<Props> {
  public static contextType = ItemContentTypeContext;

  private openModalTG = () => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTG') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.add('open');
    modalTGBack[0].classList.remove('hide');
  }

  private closeModalTG = () => {
    const modalTG = Array.from(document.getElementsByClassName('modalContentTG') as HTMLCollectionOf<HTMLElement>);
    const modalTGBack = Array.from(document.getElementsByClassName('modalContentTGBackground') as HTMLCollectionOf<HTMLElement>);
    modalTG[0].classList.remove('open');
    modalTGBack[0].classList.add('hide');
  }

  public renderFirstNode = () => {
    const { currentEntity } = this.props;

    if (currentEntity.content.children.length > 0) {
      return (
        <div className="modalContentTG__body__row line">
          <h4>
            <div className="nestedOrderNumber">1</div>
            {currentEntity.content.selectQuestion}
          </h4>
          <DescriptionEditor
            description={currentEntity.content.guidance}
            onChange={(value: string) => { currentEntity.content.setGuidance(value); }}
          />
        </div>
      );
    }
  }
  public renderChildrenNode = () => {
    const { currentEntity } = this.props;
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
            children: item
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
                {item.children.selectQuestion} {item.nroChild > 1 ? `(${intl.get('generals.option')} ${String.fromCharCode(item.nroLetter)})` : ''}
              </h4>
              <DescriptionEditor
                description={item.children.guidance}
                onChange={(value: string) => { item.children.setGuidance(value); }}
              />
            </div>
          )
        );
  }

  public render() {
    const { currentEntity } = this.props;

    return (
      <div>
        <div className="btnTeacherguide">
          <CreateButton
            title={intl.get('edit_teaching_path.buttons.edit_teacher_guidance')}
            onClick={this.openModalTG}
          >
            {intl.get('edit_teaching_path.buttons.edit_teacher_guidance')}
          </CreateButton>

          <div className="horizontalLine" />
        </div>

        <div className="modalContentTG">
          <div className="modalContentTG__header">
            <h1>ADD TEACHER GUIDANCE</h1>
            <span>How is the teacher supposed to use this teaching path?</span>
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
            <div className="modalContentTG__body__row">
              <DescriptionEditor
                description={currentEntity.guidance}
                onChange={(value: string) => { currentEntity.setGuidance(value); }}
              />
            </div>
            {this.renderFirstNode()}
            {this.renderChildrenNode()}
          </div>
          <div className="modalContentTG__footer">
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
                title={intl.get('generals.save_and_close')}
                onClick={this.closeModalTG}
                green={true}
              >
                {intl.get('generals.save_and_close')}
              </CreateButton>
            </div>
            <div className="modalContentTG__footer__aligRight">
              <button>
                <span>{intl.get('edit_teaching_path.download_pdf')}</span>
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
