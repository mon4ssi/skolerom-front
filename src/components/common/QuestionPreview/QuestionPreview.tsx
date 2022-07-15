import React, { Component } from 'react';
import { observer } from 'mobx-react';
import classnames from 'classnames';
import intl from 'react-intl-universal';

import { TextQuestionPreview } from './TextQuestion/TextQuestionPreview';
import { MultipleChoiceQuestionPreview } from './MultipleChoiceQuestion/MultipleChoiceQuestionPreview';
import { ImageChoiceQuestionPreview } from './ImageChoiceQuestion/ImageChoiceQuestionPreview';
import { QuestionAttachments } from 'assignment/view/CurrentAssignmentPage/Images/QuestionAttachments';
import { DescriptionEditor } from 'assignment/view/NewAssignment/Questions/DescriptionEditor';

import { QuestionAttachment, QuestionType, TypedQuestion } from 'assignment/Assignment';
import { EditableQuestion } from 'assignment/assignmentDraft/AssignmentDraft';
import { Answer, RedirectData } from 'assignment/questionary/Questionary';
import { ContentBlockType } from 'assignment/ContentBlock';
import { CreateButton } from '../CreateButton/CreateButton';
import { EditableImagesContentBlock, EditableTextContentBlock, EditableVideosContentBlock } from 'assignment/assignmentDraft/EditableContentBlock';
import TextAreaAutosize from 'react-textarea-autosize';

import './QuestionPreview.scss';
import clock from 'assets/images/clock-dark.svg';
import { fullMinute } from 'assignment/view/NewAssignment/AttachmentsList/Attachment';

export const mxSingleNumber = 10;

interface Props {
  question: TypedQuestion | EditableQuestion;
  answer?: Answer;
  readOnly?: boolean;
  isStudentView?: boolean;
  isTeacher?: boolean;
  withQuestionCounter?: boolean;
  withLargeCounter?: boolean;
  redirectData?: RedirectData;
  isEvaluationStyle?: boolean;
  comment?: string;
  isReadyToEvaluate?: boolean;
  isPreview?: boolean;

  handleChangeComment?(e: React.ChangeEvent<HTMLTextAreaElement>): void;
  handleShowArrowsTooltip?(value: boolean): void;
}

interface State {
  visibleCommentPanel?: number;
}

@observer
export class QuestionPreview extends Component<Props, State> {

  public state = {
    visibleCommentPanel: undefined
  };

  public componentDidMount() {
    window.scrollTo(0, 0);
  }

  public renderQuestionCounter = () => {
    const { withQuestionCounter, question } = this.props;

    return withQuestionCounter && (
      <div className="counter flexBox justifyCenter alignCenter">
        <span>{(question as EditableQuestion).orderPosition + 1}</span>
      </div>
    );
  }

  public renderLargeCounter = () => {
    const { question, withLargeCounter } = this.props;

    return withLargeCounter && (
        <span className={'largeCounter'}>
          {intl.get('answers.question')} {(question as EditableQuestion).orderPosition + 1}
        </span>
    );
  }

  public renderTitle = () => {
    const { question, isEvaluationStyle } = this.props;
    return (
      <div className={`title w100 ${isEvaluationStyle && 'evaluationTitle'}`}>
        {this.renderQuestionCounter()}
        {question.title}
      </div>
    );
  }

  public renderDurationAndTitle = (video: QuestionAttachment) => {
    const minutes = Math.trunc(video.duration! / fullMinute);
    const seconds = video.duration! % fullMinute;
    const sec = seconds < mxSingleNumber ? '0'.concat(seconds.toString()) : seconds;

    return (
      <div className={'videoDuration'}>
        <div className={'flexBox alignCenter'}>
          <span className={'fs15 fw500'}>{video.title}</span>
        </div>

        <div className={'flexBox duration'}>
          <img src={clock} alt="clock" className={'clockDuration'}/>
          <span className={'fs15 fw300'}>{minutes}:{sec}</span>
        </div>
      </div>
    );
  }

  public renderVideos = (videos: Array<QuestionAttachment>) =>
    videos.map(video => (
        <div className={'videoView'} key={video.path}>
          <video
            src={video.path}
            width="100%"
            height="100%"
            controls
          />
          {this.renderDurationAndTitle(video)}
        </div>
      )
    )

  public renderContentBlocks = () => {
    const { question, isEvaluationStyle, isTeacher, isPreview } = this.props;
    const blocks = question.content;
    return blocks.map((item, index) => {
      switch (item.type) {
        case ContentBlockType.Text: {
          const block = item as EditableTextContentBlock;
          return (
            <DescriptionEditor
              readOnly
              key={index}
              description={block.text}
            />
          );
        }
        case ContentBlockType.Images: {
          const block = item as EditableImagesContentBlock;
          const imagesPaths = block.images.map(image => image.path);
          const imagesResources = block.images;
          return imagesPaths.length > 0
            ? <QuestionAttachments key={index} paths={imagesPaths} images={imagesResources} isEvaluationStyle={isEvaluationStyle} isTeacher={isTeacher}/>
            : null;
        }
        case ContentBlockType.Videos: {
          const block = item as EditableVideosContentBlock;
          return block.videos.length > 0 ?
            <div className={'videoWrapper'} key={index}>{this.renderVideos(block.videos)}</div>
            : null;
        }
        default:
          throw new TypeError(`Unknown content block type: ${item.type}`);
      }
    });
  }

  public openCommentPanel = () => {
    const { question } = this.props;
    this.setState({ visibleCommentPanel: question.id });
  }

  public renderAnswerBlock = () => {
    const { question, answer, readOnly, redirectData, isEvaluationStyle, isStudentView, handleShowArrowsTooltip, isPreview } = this.props;

    switch (question.type) {
      case QuestionType.Text:
        return (
          <TextQuestionPreview
            question={question}
            answer={answer}
            readOnly={readOnly}
            redirectData={redirectData}
            isEvaluationStyle={isEvaluationStyle}
            handleShowArrowsTooltip={handleShowArrowsTooltip}
          />
        );
      case QuestionType.MultipleChoice:
        return (
          <MultipleChoiceQuestionPreview
            question={question}
            answer={answer}
            readOnly={readOnly}
            redirectData={redirectData}
            isEvaluationStyle={isEvaluationStyle}
            isStudentView={isStudentView}
            handleShowArrowsTooltip={handleShowArrowsTooltip}
          />
        );
      case QuestionType.ImageChoice:
        return (
          <ImageChoiceQuestionPreview
            light
            question={question}
            answer={answer}
            readOnly={readOnly}
            redirectData={redirectData}
            isEvaluationStyle={isEvaluationStyle}
            handleShowArrowsTooltip={handleShowArrowsTooltip}
          />
        );
      default:
        return undefined;
    }
  }

  public renderCommentArea = (comment?: string) => {
    const { isTeacher, handleChangeComment, isReadyToEvaluate } = this.props;

    if (!isTeacher) {
      return (
        <span className={'comment'}>{comment}</span>
      );
    }
    return (
      <TextAreaAutosize
        className={'comment'}
        placeholder={intl.get('answers.enter your comment')}
        defaultValue={comment ? comment : ''}
        onChange={handleChangeComment}
        disabled={!isReadyToEvaluate}
      />
    );
  }

  public renderCommentPanel = () => {
    const { comment, answer, isTeacher } = this.props;
    const { visibleCommentPanel } = this.state;
    const withoutTopLine = (answer && (answer.key.type === QuestionType.Text)) && 'withoutTopLine';

    if (visibleCommentPanel || comment) {
      return (
        <div className={`questionCommentWrapper ${withoutTopLine}`}>
          <div className={'questionComment'}>
            <span className={'commentTitle'}>{intl.get('answers.teachers comment')}</span>
            {this.renderCommentArea(comment)}
            {isTeacher && <CreateButton children={intl.get('answers.save comment')}/>}
          </div>
        </div>
      );
    }
  }

  public renderButtonComment = () => {
    const { isEvaluationStyle, question, comment, isReadyToEvaluate } = this.props;
    const { visibleCommentPanel } = this.state;
    const isVisibleCommentButton = isEvaluationStyle && (visibleCommentPanel !== question.id) && !comment;

    if (isVisibleCommentButton && isReadyToEvaluate) {
      return <CreateButton children={intl.get('answers.comment answer')} light onClick={this.openCommentPanel} className={'commentButton'} title="{intl.get('answers.comment answer')}" />;
    }
  }

  public render() {
    const { withQuestionCounter, isEvaluationStyle, withLargeCounter } = this.props;

    const contentClassnames = classnames(
      'mainContent w100 flexBox dirColumn',
      withQuestionCounter && 'withQuestionCounter',
      isEvaluationStyle && 'evaluationContent'
    );

    return (
      <div className={`QuestionPreview flexBox dirColumn w100 ${isEvaluationStyle ? 'isEvaluationStyle' : 'h100'}`}>
        {withLargeCounter && this.renderLargeCounter()}
        {this.renderTitle()}
        <div className={contentClassnames}>
          {this.renderContentBlocks()}
          {this.renderAnswerBlock()}
          {this.renderButtonComment()}
          {this.renderCommentPanel()}
        </div>
      </div>
    );

  }
}
