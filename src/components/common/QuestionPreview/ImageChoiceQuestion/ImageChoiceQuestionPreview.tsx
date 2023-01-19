import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Lightbox from 'react-image-lightbox';
import intl from 'react-intl-universal';

import { ImageChoiceQuestion, ImageChoiceQuestionOption, QuestionAttachment, TypedQuestion } from 'assignment/Assignment';
import {
  EditableImageChoiceQuestion,
  EditableImageChoiceQuestionOption,
  EditableQuestion
} from 'assignment/assignmentDraft/AssignmentDraft';
import { Answer, RedirectData } from 'assignment/questionary/Questionary';

import bilde from 'assets/images/bilde.svg';

import select from 'assets/images/select.svg';
import selectBlueGray from 'assets/images/select-blue-gray.svg';
import zoom from 'assets/images/zoom.svg';

import './ImageChoiceQuestionPreview.scss';

type Question = TypedQuestion | EditableQuestion;
type QuestionOptions = Array<ImageChoiceQuestionOption | EditableImageChoiceQuestionOption>;

interface Props {
  question: Question;
  answer?: Answer;
  readOnly?: boolean;
  light?: boolean;
  redirectData?: RedirectData;
  isEvaluationStyle?: boolean;
  isPreview?: boolean;
  handleShowArrowsTooltip?(status: boolean): void;
}

interface ImageOptionProps {
  option: ImageChoiceQuestionOption | EditableImageChoiceQuestionOption;
  question: Question;
  readOnly?: boolean;
  answer?: Answer;
  handleChooseAnswer: (title: string) => void;
  isEvaluationStyle?: boolean;
  light?: boolean;
}

interface ImageOptionState {
  isLightBoxOpen: boolean;
}

@observer
class ImageOption extends Component<ImageOptionProps, ImageOptionState> {
  private refInput = createRef<HTMLButtonElement>();
  public state = {
    isLightBoxOpen: false,
  };

  public setIsRight = () => {
    const { handleChooseAnswer, option } = this.props;
    handleChooseAnswer(option.title);
  }

  public openLightbox = () => {
    if (!this.props.readOnly && !this.props.isEvaluationStyle) {
      this.setState({ isLightBoxOpen: true });
    }
  }

  public closeLightbox = () => {
    this.setState({ isLightBoxOpen: false });
  }

  public renderLightBox = () => {
    const { option } = this.props;

    return (
      <Lightbox
        mainSrc={option.image!.path}
        onCloseRequest={this.closeLightbox}
      />
    );
  }

  public calculateIsRightInputStyle = () => {
    const { option, answer, isEvaluationStyle } = this.props;
    const isValueSelected = answer && answer.value.includes(option.title);

    if (isEvaluationStyle) {
      return option.isRight ? 'inputRight' : (isValueSelected && !option.isRight) ? 'inputWrong' : '';
    }
  }
  public async componentDidMount() {
    if (!this.props.readOnly && this.refInput.current) {
      const focusCurrentOption = Array.from(document.getElementsByClassName('ImagenfocusCurrentOption') as HTMLCollectionOf<HTMLElement>);
      focusCurrentOption[0].focus();
    }
  }

  public renderCustomImageInfo = (option: QuestionAttachment) => {
    if (option) {
      return (
        <div style={{ padding: '9px', fontSize: '13px', fontStyle: 'italic', color: '#993266 !important' }}>
          <div style={{ fontStyle: 'Italic', color: '#767168', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option!.title}</div>
          <div style={{ fontStyle: 'Italic', color: '#767168', fontWeight: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {option.source !== '' && option.source !== null ? `${intl.get('new assignment.updateCustomImagesForm.source')}: ${option.source!.includes(',') ? option.source!.split(',')[0] : option.source!}` : ''}
          </div>
        </div>
      );
    }
  }

  public render() {
    const { option, answer, light, isEvaluationStyle, readOnly } = this.props;
    const isValueSelected = answer && answer.value.includes(option.title);
    const imageOptionClassNames = classnames(`ImageOption ${this.calculateIsRightInputStyle()}`, {
      ImageOption_selected: isValueSelected,
      ImageOption_cursorDefault: (isEvaluationStyle || readOnly)
    });
    const imageOptionImageClassNames = classnames('ImageOption__shape', {
      ImageOption_cursorDefault: (isEvaluationStyle || readOnly)
    });
    const imageOptionTickClassNames = classnames('ImageOption__button', {
      ImageOption_cursorDefault: (isEvaluationStyle || readOnly),
      ImageOption__button_selected: isValueSelected
    });

    const isCustomImageAttachment = true && (option.image && (!option!.image!.path!.includes('wp-content') && !option!.image!.path!.includes('sites')));

    const optionTitleStyle = `fs15 fw500 tc1 ImageOption__title ${(isValueSelected && light) ? 'light' : isValueSelected && 'isSelected'}`;

    return (
      <div className={imageOptionClassNames}>
        <img
          className="ImageOption__image"
          src={option.image ? option.image.path : bilde}
          alt="bilde"
        />
        <div className={imageOptionImageClassNames} onClick={this.openLightbox}>
          <img src={zoom} alt="Zoom" />
        </div>
        {this.renderCustomImageInfo(option.image!)}
        <div className={optionTitleStyle}>
          {option!.title}
        </div>
        <button className={`ImagenfocusCurrentOption ${imageOptionTickClassNames}`} onClick={this.setIsRight} title="Check" ref={this.refInput}>
          <img
            className="ImageOption__buttonImage"
            src={isValueSelected ? select : selectBlueGray}
            alt="check_icon"
          />
        </button>

        {this.state.isLightBoxOpen && this.renderLightBox()}
      </div>
    );
  }
}

@observer
export class ImageChoiceQuestionPreview extends Component<Props> {

  public handleChooseAnswer = (title: string) => {
    const { answer, readOnly, redirectData, handleShowArrowsTooltip, isPreview } = this.props;
    if (readOnly) return;

    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }

    let answerValue = answer!.value as Array<string>;
    answerValue.includes(title) ?
      answerValue = answerValue.filter(item => item !== title) :
      answerValue = [...answerValue, title];
    if (isPreview) {
      answer!.setValueFalse(answerValue, redirectData);
    } else {
      answer!.setValue(answerValue, redirectData);
    }
  }

  public renderOptions = () => {
    const { question, readOnly, answer, isEvaluationStyle, light } = this.props;

    return (
      ((question as ImageChoiceQuestion | EditableImageChoiceQuestion).options as QuestionOptions).map((option, index) => (
        <div key={`option-${option.title}-${index}`}>
          <ImageOption
            readOnly={readOnly || !option.image}
            option={option}
            question={question}
            answer={answer}
            light={light}
            handleChooseAnswer={this.handleChooseAnswer}
            isEvaluationStyle={isEvaluationStyle}
          />
        </div>
      )));
  }

  public render() {
    return (
      <div className="ImageChoiceQuestionPreview">
        {this.renderOptions()}
      </div>
    );
  }
}
