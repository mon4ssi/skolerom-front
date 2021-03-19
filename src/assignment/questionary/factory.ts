import { DraftQuestionaryRequestDTO, QuestionaryRequestDTO, QuestionaryResponseDTO } from './api';
import { Answer, Questionary, RedirectData } from './Questionary';
import {
  Article,
  Assignment,
  ImageChoiceQuestion,
  ImageChoiceQuestionOption,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionOption,
  QuestionType,
  TextQuestion,
  TypedQuestion
} from 'assignment/Assignment';
import { ContentBlockDTO, ImageChoiceQuestionOptionDTO, MultipleChoiceQuestionOptionDTO,
  QuestionDTO, TeacherAssignmentByIdResponseDTO } from '../api';
import { ContentBlockType, ImageContentBlock, TextContentBlock, VideoContentBlock } from '../ContentBlock';

const buildAnswerContent = (answers: Array<Answer>) => (
  answers.map(
    (answer) => {
      let payload: string | Array<{ optionId: number, title: string }>;
      if (answer.key.type === 'TEXT') {
        payload = answer.value as string;
      } else if (
        answer.key.type === 'MULTIPLE_CHOICE' ||
        answer.key.type === 'IMAGE_CHOICE'
      ) {
        const values = Array.isArray(answer.value) ? answer.value : [];

        payload = values.map(
          (value) => {
            const optionId = answer.key.options.findIndex(
              option => option.title === value
            );
            return { optionId, title: value };
          }
        );
      }

      return {
        payload: payload!,
        questionId: answer.key.id!,
        type: answer.key.type,
      };
    }
  )
);

export const buildQuestionaryRequestDTO = (questionary: Questionary, redirectData?: RedirectData): QuestionaryRequestDTO => ({
  redirectData,
  uuid: questionary.uuid,
  answerContent: buildAnswerContent(questionary.answers)
});

export const buildDraftQuestionaryDTO = (questionary: Questionary): DraftQuestionaryRequestDTO => ({
  uuid: questionary.uuid,
  answerContent: buildAnswerContent(questionary.answers)
});

const buildRelatedArticles = (articles: Array<Article>): Array<Article> => (
  articles.map(item => new Article({
    title: item.title,
    id: Number(item.wpId),
    isRead: item.isRead,
    levels: item.levels,
    correspondingLevelArticleId: item.correspondingLevelArticleId
  }))
);

export const buildQuestionary = (dto: QuestionaryResponseDTO, assignmentId: number) => {
  const questionary = new Questionary({
    id: dto.id,
    uuid: dto.uuid!,
    idRevision: dto.revision.id,
    redirectData: dto.redirectData ? dto.redirectData : undefined,
    assignment: new Assignment({
      ...dto.revision,
      relatedArticles: dto.revision.relatedArticles && dto.revision.relatedArticles.length > 0
        ? buildRelatedArticles(dto.revision.relatedArticles)
        : [],
      id: assignmentId,
      author: dto.revision.author,
      questions: dto.revision.questions.map(buildQuestion),
      featuredImage: dto.revision.featuredImage ? dto.revision.featuredImage : undefined
    })
  });

  questionary.setAnswers(dto.revision.questions ? dto.revision.questions.map(
    (question, index) => {
      const currentAnswer = dto.answers && dto.answers.find(answer => answer.questionId === question.id);
      const currentAnswerValue = (currentAnswer && currentAnswer.payload) ? currentAnswer.payload : '';
      return new Answer({
        questionary,
        key: buildQuestion(question, index) as TypedQuestion,
        value: typeof currentAnswerValue === 'string' ? currentAnswerValue : currentAnswerValue.map(el => el.title)
      });
    }) : []);

  return questionary;
};

const buildQuestion = (dto: QuestionDTO, index: number) => {
  const id = dto.id;
  const title = dto.title;
  const order = dto.orderPosition || index;
  const contentBlocks = dto.content!.map(buildContentBlock);

  switch (dto.type) {
    case QuestionType.Text: {
      return new TextQuestion({
        id,
        title,
        order,
        contentBlocks,
      });
    }

    case QuestionType.MultipleChoice: {
      return new MultipleChoiceQuestion(
        {
          id,
          title,
          order,
          contentBlocks,
          options: dto.options!.map(dto => buildMultipleChoiceOption(dto))
        }
      );
    }

    case QuestionType.ImageChoice: {
      return new ImageChoiceQuestion(
        {
          id,
          title,
          order,
          contentBlocks,
          options: dto.options!.map(dto => buildImageChoiceOption(dto))
        }
      );
    }

    default:
      throw new TypeError(`Unknown question type: ${dto.type}`);
  }
};

const buildMultipleChoiceOption = (
  dto: MultipleChoiceQuestionOptionDTO
) => new MultipleChoiceQuestionOption(
  dto.title || '',
  dto.isRight || false,
);

const buildImageChoiceOption = (
  dto: ImageChoiceQuestionOptionDTO
) => new ImageChoiceQuestionOption(
  dto.title || '',
  dto.image || undefined,
  dto.orderPosition || 0,
  dto.isRight || false
);

const buildContentBlock = (dto: ContentBlockDTO) => {
  switch (dto.type) {
    case ContentBlockType.Text:
      return new TextContentBlock({
        text: dto.text!,
        order: dto.orderPosition
      });
    case ContentBlockType.Images:
      return new ImageContentBlock({
        images: dto.images!,
        order: dto.orderPosition
      });
    case ContentBlockType.Videos:
      return new VideoContentBlock({
        videos: dto.videos!,
        order: dto.orderPosition
      });
    default:
      throw new TypeError(`Unknown content block type: ${dto.type}`);
  }
};

export const buildQuestionaryView = (dto: TeacherAssignmentByIdResponseDTO) => {
  const questionary = new Questionary({
    id: 0,
    assignment: new Assignment({
      ...dto,
      questions: dto.questions.map(buildQuestion),
      relatedArticles: dto.relatedArticles && dto.relatedArticles.length > 0 ? buildRelatedArticles(dto.relatedArticles) : [],
      ownedByMe: dto.ownedByMe,
    }),
  });

  questionary.setAnswers(dto.questions ? dto.questions.map((question: QuestionDTO, index: number) => new Answer({
    questionary,
    key: buildQuestion(question, index) as TypedQuestion,
    value: '',
  })) : []);

  return questionary;
};
