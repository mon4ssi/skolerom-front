import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import Lightbox from 'react-image-lightbox';

import { ImageChoiceQuestion, ImageChoiceQuestionOption, TypedQuestion } from 'assignment/Assignment';
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
    if (this.refInput.current) {
      const focusCurrentOption = Array.from(document.getElementsByClassName('ImagenfocusCurrentOption') as HTMLCollectionOf<HTMLElement>);
      focusCurrentOption[0].focus();
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

    const optionTitleStyle = `fs15 fw500 tc1 ImageOption__title ${(isValueSelected && light) ? 'light' : isValueSelected && 'isSelected'}`;

    return (
      <div className={imageOptionClassNames}>
        <img
          className="ImageOption__image"
          src={option.image ? option.image.path : bilde}
          alt="bilde"
        />
        <div className={imageOptionImageClassNames} onClick={this.openLightbox}>
          <img src={zoom} alt="Zoom"/>
        </div>
        <div className={optionTitleStyle}>
          {option.title}
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
    const { answer, readOnly, redirectData, handleShowArrowsTooltip } = this.props;
    if (readOnly) return;

    if (handleShowArrowsTooltip) {
      handleShowArrowsTooltip(true);
    }

    let answerValue = answer!.value as Array<string>;
    answerValue.includes(title) ?
      answerValue = answerValue.filter(item => item !== title) :
      answerValue = [...answerValue, title];

    answer!.setValue(answerValue, redirectData);
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
