import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import intl from 'react-intl-universal';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';
import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { ItemContentTypeContext } from 'teachingPath/view/EditTeachingPath/ItemContentTypeContext';
import './TeacherguidanceModal.scss';
import { CreateButton } from '../CreateButton/CreateButton';
import trashImg from 'assets/images/trash-tp.svg';

interface Props {
  currentEntity: DraftTeachingPath;
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

  public render() {
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
                src={trashImg}
                alt={intl.get('generals.close')}
                title={intl.get('generals.close')}
                onClick={this.closeModalTG}
              />
            </div>
          </div>
          <div className="modalContentTG__body">
            123456
          </div>
          <div className="modalContentTG__footer">
            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" className="btn btn-primary">Send message</button>
          </div>
        </div>
        <div className="modalContentTGBackground hide">&nbsp;</div>
      </div>
    );
  }
}
