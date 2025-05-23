import { DraftAssignmentRequestDTO, DraftAssignmentResponseDTO, NewDraftAssignmentResponseDTO } from './api';
import { ContentBlockDTO, ImageChoiceQuestionOptionDTO, MultipleChoiceQuestionOptionDTO, QuestionDTO } from '../api';
import { buildAssignmentDTO } from '../factory';
import { Assignment, QuestionType, Grade, Subject } from 'assignment/Assignment';
import {
  DraftAssignment, EditableImageChoiceQuestion, EditableImageChoiceQuestionOption,
  EditableMultipleChoiceQuestion,
  EditableMultipleChoiceQuestionOption,
  EditableQuestion,
  EditableTextQuestion,
} from './AssignmentDraft';
import { ContentBlockType } from '../ContentBlock';
import { EditableImagesContentBlock, EditableTextContentBlock, EditableVideosContentBlock } from './EditableContentBlock';

export const buildNewDraftAssignment = (dto: NewDraftAssignmentResponseDTO) => {
  const assignment = new Assignment({
    id: dto.id,
    title: '',
    isCopy: dto.isCopy,
  });

  return new DraftAssignment({
    assignment,
    sessionId: dto.uuid,
    questionsWithError: null,
  });
};

export const buildDraftAssignment = (dto: DraftAssignmentResponseDTO): DraftAssignment => {
  const assignmentContent = JSON.parse(JSON.stringify(dto.assignmentContent));
  const assignment = new Assignment({
    id: dto.id,
    updatedAt: dto.updatedAt,
    isPrivate: dto.isPrivate,
    isMySchool: dto.isMySchool,
    mySchools: dto.mySchools,
    backgroundImage: dto.backgroundImage,
    grades: dto.grades.map(grade => new Grade(grade.id, grade.title)),
    subjects: dto.subjects.map(subject => new Subject(subject.id, subject.title, subject.description!)),
    levels: dto.levels.map(level => level),
    ...assignmentContent,
    isCopy:dto.isCopy,
    inReview:dto.inReview,
    grepCoreElementsIds:dto.grepCoreElementsIds,
    grepMainTopicsIds:dto.grepMainTopicsIds,
    grepReadingInSubjectsIds:dto.grepReadingInSubjectsIds,
    grepGoalsIds:dto.grepGoalsIds,
    sources:dto.sources,
    keywords: dto.keywords,
    guidance:dto.guidance,
    hasGuidance:dto.hasGuidance,
    open: dto.open,
    schools: dto.schools,
    localeId: dto.localeId,
    isTranslations: dto.isTranslations,
    translations: dto.translations,
    originalLocaleId: dto.originalLocaleId
  });

  const draftAssignment = new DraftAssignment({ assignment, sessionId: dto.uuid, questionsWithError: null });

  draftAssignment.questions =
    assignmentContent.questions.map((item: QuestionDTO, index: number) => buildEditableQuestion(item, draftAssignment, index));

  return draftAssignment;
};

const buildEditableQuestion = (
  dto: QuestionDTO,
  assignmentDraft: DraftAssignment,
  index: number
): EditableQuestion => {

  const title = dto.title;
  const guidance = dto.guidance;
  const hide_answer = dto.hide_answer;
  const order = dto.orderPosition || index;
  const contentBlocks = dto.content;

  switch (dto.type) {
    case QuestionType.Text: {
      const question: EditableTextQuestion = new EditableTextQuestion({
        title,
        guidance,
        hide_answer,
        order,
        assignmentDraft,
        contentBlocks: []
      });

      if (dto.content && dto.content.length > 0) {
        question.setContentBlocks(
          contentBlocks!.map(
            (dto: ContentBlockDTO) => buildEditableContentBlock(dto, question)
          )
        );
      }

      return question;
    }

    case QuestionType.MultipleChoice: {
      const question: EditableMultipleChoiceQuestion = new EditableMultipleChoiceQuestion(
        {
          title,
          guidance,
          hide_answer,
          order,
          assignmentDraft,
          contentBlocks: [],
          options: [],
        }
      );

      question.setOptions(dto.options!.map(dto =>
        buildMultipleChoiceOption(dto, question)
      ));

      if (dto.content && dto.content.length > 0) {
        question.setContentBlocks(
          contentBlocks!.map(
            (dto: ContentBlockDTO) => buildEditableContentBlock(dto, question)
          )
        );
      }

      return question;
    }

    case QuestionType.ImageChoice: {
      const question: EditableImageChoiceQuestion = new EditableImageChoiceQuestion(
        {
          title,
          guidance,
          hide_answer,
          order,
          assignmentDraft,
          contentBlocks: [],
          options: [],
        }
      );

      question.options = dto.options!.map(dto =>
        buildImageChoiceOption(dto, question)
      );

      if (dto.content && dto.content.length > 0) {
        question.setContentBlocks(
          contentBlocks!.map(
            (dto: ContentBlockDTO) => buildEditableContentBlock(dto, question)
          )
        );
      }

      return question;
    }

    default:
      throw new TypeError(`Unknown question type: ${dto.type}`);
  }
};

const buildEditableContentBlock = (dto: ContentBlockDTO, question: EditableQuestion) => {
  switch (dto.type) {
    case ContentBlockType.Text:
      return new EditableTextContentBlock({
        question,
        text: dto.text!,
        order: dto.orderPosition
      });
    case ContentBlockType.Images:
      return new EditableImagesContentBlock({
        question,
        images: dto.images!,
        order: dto.orderPosition
      });
    case ContentBlockType.Videos:
      return new EditableVideosContentBlock({
        question,
        videos: dto.videos!,
        order: dto.orderPosition
      });
    default:
      throw new TypeError(`Unknown content block type: ${dto.type}`);
  }
};

const buildMultipleChoiceOption = (
  dto: MultipleChoiceQuestionOptionDTO,
  question: EditableMultipleChoiceQuestion
) => new EditableMultipleChoiceQuestionOption(
    dto.title || '',
    dto.isRight || false,
    question
  );

const buildImageChoiceOption = (
  dto: ImageChoiceQuestionOptionDTO,
  question: EditableImageChoiceQuestion
) =>
  new EditableImageChoiceQuestionOption(
    dto.title || '',
    dto.image || undefined,
    dto.orderPosition || 0,
    dto.isRight || false,
    question
  );

export const buildDraftAssignmentDTO = (
  draftAssignment: DraftAssignment
): DraftAssignmentRequestDTO => ({
  uuid: draftAssignment.sessionId,
  backgroundImage: draftAssignment.backgroundImage!,
  featuredImage: draftAssignment.featuredImage!,
  title: draftAssignment.title,
  description: draftAssignment.description,
  guidance: draftAssignment.guidance,
  numberOfQuestions: draftAssignment.numberOfQuestions || draftAssignment.questions.length,
  isPrivate: draftAssignment.isPrivate,
  isMySchool: draftAssignment.isMySchool,
  mySchools: draftAssignment.mySchools,
  isPublished: draftAssignment.isPublished,
  subjects: draftAssignment.subjects,
  grades: draftAssignment.grades,
  levels: draftAssignment.levels,
  assignmentContent: buildAssignmentDTO(draftAssignment),
  isCopy: draftAssignment.isCopy,
  inReview: draftAssignment.inReview,
  grepCoreElementsIds: draftAssignment.grepCoreElementsIds,
  grepGoalsIds: draftAssignment.grepGoalsIds,
  grepMainTopicsIds: draftAssignment.grepMainTopicsIds,
  grepReadingInSubjectsIds: draftAssignment.grepReadingInSubjectsIds,
  sources: draftAssignment.sources,
  keywords: draftAssignment.keywords,
  open: draftAssignment._open,
  localeId: draftAssignment.localeId!
});
