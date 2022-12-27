import React, { ChangeEvent, Component } from 'react';
import intl from 'react-intl-universal';
import { inject, observer } from 'mobx-react';
import TextAreaAutosize from 'react-textarea-autosize';

import { DraftAssignment } from 'assignment/assignmentDraft/AssignmentDraft';
import { CreationElements, NewAssignmentStore } from '../NewAssignmentStore';
import { lettersNoEn } from 'utils/lettersNoEn';
import { MAX_DESCRIPTION_LENGTH, MAX_DESCRIPTION_LENGTH_500, MAX_TITLE_LENGTH } from 'utils/constants';

import './AssignmentTitle.scss';
import { DetailsModal } from 'components/common/DetailsModal/DetailsModal';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import teaGuiBGImg from 'assets/images/guidance-bg.svg';

interface Props {
  assignment: DraftAssignment;
  newAssignmentStore?: NewAssignmentStore;
}

@inject('newAssignmentStore')
@observer
export class AssignmentTitle extends Component<Props> {
  private descriptionField: HTMLTextAreaElement | null = null;
  private titleField: HTMLTextAreaElement | null = null;
  private titleRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();
  private descriptionRef = React.createRef<TextAreaAutosize & HTMLTextAreaElement>();

  public setAssignmentTitle = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const value = e.currentTarget.value;
    if (value === '' || lettersNoEn(value)) {
      this.props.assignment.setTitle(value);
    }
  }

  public setAssignmentDescription = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    e.preventDefault();
    const value = e.currentTarget.value;
    if (value === '' || lettersNoEn(value)) {
      this.props.assignment.setDescription(value);
    }
  }

  public setHighlightedItem = () => {
    this.props.newAssignmentStore!.setHighlightingItem(CreationElements.Title);
  }

  public componentDidMount() {
    this.titleRef.current!.focus();
    this.titleRef.current!.selectionStart = this.titleRef.current!.selectionEnd - this.titleRef.current!.value!.length;
    // this.titleField!.setSelectionRange(this.props.assignment.title.length, this.props.assignment.title.length);
  }

  public openModalTGAssig = (nroLevel: string) => {
    this.props.newAssignmentStore!.openTeacherGuidanceAssig(nroLevel);
  }

  public render() {
    const { assignment, newAssignmentStore } = this.props;
    const lightItem = newAssignmentStore!.isHighlightedItem(CreationElements.Title) ? 'lightItem' : '';
    const isPublishedAndPrivate = this.props.assignment!.isPrivate!;

    return (
      <div className={`AssignmentTitle ${lightItem}`} onClick={this.setHighlightedItem}>
        <div className="assignmentTitleWrapper flexBox dirColumn">
          <span className="fw500">
            {intl.get('assignments_tabs.new_assignment')}
          </span>
          <label id="titleInputTextArea" className="hidden">{intl.get('new assignment.title.title_placeholder')}</label>
          <TextAreaAutosize
            autoFocus
            value={assignment!.title}
            className={`newAssignmentTitleInput ${lightItem}`}
            onChange={this.setAssignmentTitle}
            placeholder={intl.get('new assignment.title.title_placeholder')}
            inputRef={this.titleRef}
            maxLength={MAX_TITLE_LENGTH}
            aria-labelledby="titleInputTextArea"
          />
          <label id="DescriptionInputTextArea" className="hidden">{intl.get('new assignment.title.description_placeholder')}</label>
          <TextAreaAutosize
            className={`newAssignmentDescriptionInput fw300 ${lightItem}`}
            placeholder={intl.get('new assignment.title.description_placeholder')}
            value={assignment.description}
            onChange={this.setAssignmentDescription}
            inputRef={this.descriptionRef}
            maxLength={MAX_DESCRIPTION_LENGTH_500}
            aria-labelledby="DescriptionInputTextArea"
          />
          <div className="sectionGuidance sectionGuidanceFlex">
            {!isPublishedAndPrivate && <DetailsModal isAssignment={true} currentQuestionaryStore={newAssignmentStore!} drafAssignment={assignment} />}
            <CreateButton
              title={newAssignmentStore!.getTitleButtonGuidance}
              onClick={this.openModalTGAssig.bind(this, '0')}
            >
              <img src={teaGuiBGImg} alt={newAssignmentStore!.getTitleButtonGuidance} />
              {newAssignmentStore!.getTitleButtonGuidance}
            </CreateButton>
          </div>
        </div>
      </div>
    );
  }
}
