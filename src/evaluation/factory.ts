import isNull from 'lodash/isNull';
import { AnswersResponseDTO, TeachingPathAnswerResponseDTO, StudentTeachingPathEvaluationDTO } from './api';
import { EditableEvaluation, EvaluationAnswer } from 'evaluation/Evaluation';
import {
  Assignment,
  ImageChoiceQuestion, ImageChoiceQuestionOption,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionOption,
  QuestionType,
  TextQuestion,
  TypedQuestion,
  Article
} from 'assignment/Assignment';
import { Answer, Questionary } from 'assignment/questionary/Questionary';

export const buildEvaluateQuestions = (dto: AnswersResponseDTO): EvaluationAnswer => {
  const questions = dto.revisionContent.questions.map((question) => {
    let typedQuestion;
    switch (question.type) {
      case QuestionType.Text: {
        typedQuestion = new TextQuestion({
          id: question.id,
          title: question.title,
          order: question.orderPosition,
          contentBlocks: question.content
        });
        break;
      }
      case QuestionType.MultipleChoice: {
        typedQuestion = new MultipleChoiceQuestion({
          id: question.id,
          title: question.title,
          order: question.orderPosition,
          contentBlocks: question.content,
          options: question.options ? question.options.map(option => new MultipleChoiceQuestionOption(option.title, option.isRight)) : []
        });
        break;
      }
      case QuestionType.ImageChoice: {
        typedQuestion = new ImageChoiceQuestion({
          id: question.id,
          title: question.title,
          order: question.orderPosition,
          contentBlocks: question.content,
          options: question.options ? question.options.map(option =>
             new ImageChoiceQuestionOption(option.title, option.image, option.orderPosition!, option.isRight)) : []
        });
        break;
      }
      default:
        break;
    }
    return typedQuestion as TypedQuestion;
  });

  let answers: Array<{ answerBlock: Answer, comment?: string }> = [];
  if (questions.length > 0) {
    answers = dto.revisionContent.answers.map(answer => ({
      answerBlock: new Answer({
        key: questions.find(question => question!.id === answer.questionId) as TypedQuestion,
        value: typeof answer.payload === 'string' ?  answer.payload : answer.payload.map(item => item.title),
        questionary: new Questionary({ id: answer.questionAnswerId, assignment: new Assignment({ id: answer.questionId }) })
      }),
      comment: isNull(answer.comment) ? undefined : answer.comment
    }));
  }

  const evaluationAnswer = {
    comment: dto.comment,
    revisionId: dto.revisionId,
    assignmentId: dto.assignmentId,
    revisionContent: {
      answers,
      questions
    },
    readArticleData: dto.readArticleData.map(article => new Article(article))
  };

  return new EvaluationAnswer(evaluationAnswer);
};

export const buildSaveEvaluationDTO = (evaluation: EditableEvaluation) => ({
  uuid: evaluation.uuid,
  mark: evaluation.mark,
  status: evaluation.status,
  isPassed: evaluation.isPassed,
  content: evaluation.content
});

export const buildEvaluateTeachingPath = (dto: TeachingPathAnswerResponseDTO) => ({
  ...dto,
  assignmentAnswers: dto.assignmentAnswers.map(buildEvaluateQuestions)
});

export const buildStudentTeachingPathEvaluation = (dto: StudentTeachingPathEvaluationDTO) => ({
  ...dto,
  assignmentAnswers: dto.assignmentAnswers.map(buildEvaluateQuestions)
});
