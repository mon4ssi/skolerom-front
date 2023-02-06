import {
  Article, ArticleLevel,
  Assignment, Attachment,
  Filter,
  Grade,
  ImageChoiceQuestion,
  ImageChoiceQuestionOption,
  MultipleChoiceQuestion,
  MultipleChoiceQuestionOption,
  Question,
  QuestionAttachment,
  QuestionType,
  Subject
} from './Assignment';
import {
  ArticleDTO,
  AssignmentRequestDTO, AttachmentDTO,
  ContentBlockDTO,
  ImageChoiceQuestionOptionDTO,
  MultipleChoiceQuestionOptionDTO,
  QuestionDTO,
  StudentAssignmentResponseDTO, StudentLevelDTO
} from './api';
import { ContentBlock } from './ContentBlock';
import { EditableImagesContentBlock, EditableTextContentBlock, EditableVideosContentBlock } from './assignmentDraft/EditableContentBlock';
import isNil from 'lodash/isNil';
import isNull from 'lodash/isNull';

export interface SubjectDTO {
  id: number;
  name: string;
  title: string;
  description: string;
  filterStatus: string | undefined | null;
  managementId: number | null;
}

export interface SourceDTO {
  id: number;
  name: string;
  title: string;
  default: boolean;
}

export interface GradeDTO {
  id: number;
  title: string;
  name: string;
  managementId: number | null;
}

export interface GreepElements {
  kode: string;
  description: string;
}

export interface AssignmentDistributeDTO {
  id: number;
  title: string;
  numberOfQuestions: number;
  answeredDistributes: number;
  totalDistributes: number;
  featuredImage: string | null;
  defaultEndDate: string;
  defaultStartDate: string;
  grades: Array<GradeDTO>;
  subjects: Array<SubjectDTO>;
  grep_coreelements?: Array<GreepElements>;
  grep_goals?: Array<GreepElements>;
  grep_maintopic?: Array<GreepElements>;
  grep_readinginsubject?: string;
}

interface DraftAssignmentResponseDTO {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  numberOfQuestions: number;
  isPrivate: boolean;
  isPublished: boolean;
  isDistributed: boolean;
  assignmentContent: Assignment;
  subjects: Array<Subject>;
  grades: Array<Grade>;
  levels: Array<number>;
  isChanged: boolean;
  backgroundImage: string;
  createByContentManager?: boolean;
  grep_coreelements?: Array<GreepElements>;
  grep_goals?: Array<GreepElements>;
  grep_maintopic?: Array<GreepElements>;
  grep_readinginsubject?: string;
  canEditOrDelete?: boolean;
}

export interface TeacherAssignmentResponseDTO {
  id: number;
  title: string;
  description: string;
  hasGuidance?: boolean;
  numberOfQuestions: number;
  view: string;
  grades: Array<GradeDTO>;
  subjects: Array<SubjectDTO>;
  featuredImage?: string;
  levels: Array<number>;
  createByContentManager?: boolean;
  isPublished?: boolean;
  isDistributed?: boolean;
  grepCoreelements?: Array<GreepElements>;
  grepGoals?: Array<GreepElements>;
  grepMaintopic?: Array<GreepElements>;
  grepReadinginsubject?: string;
  open?: boolean;
  canEditOrDelete?: boolean;
}

export const buildFilterDTO = (filter: Filter): Object => {
  const filterDTO: { [key: string]: string | number | boolean } = {};
  if (filter.page) {
    filterDTO.page = filter.page;
  }

  if (filter.per_page) {
    filterDTO.per_page = filter.per_page;
  }

  if (typeof filter.isPublished === 'number') {
    filterDTO.isPublished = filter.isPublished;
  }

  if (filter.order) {
    filterDTO.order = filter.order;
  }

  if (filter.orderField) {
    filterDTO.orderField = filter.orderField;
  }

  if (filter.subject) {
    filterDTO.subject = filter.subject;
  }

  if (filter.grade) {
    filterDTO.grade = filter.grade;
  }

  if (filter.searchQuery) {
    filterDTO.searchQuery = filter.searchQuery;
  }

  if (filter.isAnswered) {
    filterDTO.isAnswered = filter.isAnswered;
  }

  if (filter.grepCoreElementsIds) {
    filterDTO.grepCoreElementsIds = filter.grepCoreElementsIds;
  }

  if (filter.grepMainTopicsIds) {
    filterDTO.grepMainTopicsIds = filter.grepMainTopicsIds;
  }

  if (filter.grepGoalsIds) {
    filterDTO.grepGoalsIds = filter.grepGoalsIds;
  }

  if (filter.grepReadingInSubject) {
    filterDTO.grepReadingInSubject = filter.grepReadingInSubject;
  }

  if (filter.source) {
    filterDTO.source = filter.source;
  }

  if (filter.isEvaluated) {
    filterDTO.isEvaluated = filter.isEvaluated;
  }

  if (typeof filter.showMyAssignments === 'number') {
    filterDTO.showMyAssignments = filter.showMyAssignments;
  }

  if (filter.showMySchoolTeachingpath) {
    filterDTO.onlyOwnSchools = filter.showMySchoolTeachingpath;
  }

  if (filter.articles) {
    filterDTO.articles = filter.articles;
  }

  if (filter.locale) {
    filterDTO.locale = filter.locale;
  }

  if (filter.inReview) {
    filterDTO.inReview = filter.inReview;
  }

  return filterDTO;
};

const buildMultipleChoiceOptionDTO = (option: MultipleChoiceQuestionOption): MultipleChoiceQuestionOptionDTO => ({
  title: option.title,
  isRight: option.isRight,
});

const buildImageChoiceOptionDTO = (option: ImageChoiceQuestionOption): ImageChoiceQuestionOptionDTO => ({
  title: option.title,
  image: option.image,
  orderPosition: option.order,
  isRight: option.isRight,
});

export const buildQuestionDTO = (question: Question): QuestionDTO => {
  const dto: QuestionDTO = {
    type: question.type,
    title: question.title,
    guidance: question.guidance,
    orderPosition: question.orderPosition,
    hide_answer: question.hide_answer,
    content: question.content.map(buildContentBlockDTO),
  };

  if (question.type === QuestionType.MultipleChoice) {
    dto.options = (question as MultipleChoiceQuestion).options.map(buildMultipleChoiceOptionDTO);
  }
  if (question.type === QuestionType.ImageChoice) {
    dto.options = (question as ImageChoiceQuestion).options.map(buildImageChoiceOptionDTO);
  }

  return dto;
};

const buildContentBlockDTO = (block: ContentBlock): ContentBlockDTO => {
  const buffer: ContentBlockDTO = {
    orderPosition: block.order,
    type: block.type,
  };

  if (block instanceof EditableTextContentBlock) {
    buffer.text = block.text;
  }
  if (block instanceof EditableImagesContentBlock) {
    buffer.images = block.images.map(i => ({ id: i.id, path: i.path, title: i.title, source: i.source , src: i.src! })) as Array<QuestionAttachment>;
  }
  if (block instanceof EditableVideosContentBlock) {
    buffer.videos = block.videos;
  }
  return buffer;
};

const buildRelatedArticleDTO = (articles: Array<Article>) => (
  articles.map(article => ({
    ...article,
    levels: article.levels!.map(level => ({
      ...level,
      childArticles: level.childArticles && level.childArticles.length ? level.childArticles.map(
        item => ({
          title: item.title,
          wpId: item.wpId || item.id,
          levels: [{
            ...item.levels![0]
          }]
        })
      ) : undefined
    })),
    wpId: article.id,
    title: article.title,
    isHidden: article.isHidden
  }))
);

export const buildAssignmentDTO = (assignment: Assignment): AssignmentRequestDTO => {
  const buffer = assignment.questions.map(buildQuestionDTO);

  return {
    title: assignment.title,
    description: assignment.description,
    questions: buffer,
    visibility: assignment.isPrivate,

    relatedArticles: buildRelatedArticleDTO(assignment.relatedArticles),
    featuredImage: assignment.featuredImage,
  };
};

export const buildSubject = (subject: SubjectDTO): Subject => ({
  id: subject.id,
  description: subject.description,
  title: subject.title || subject.name,
  filterStatus: subject.filterStatus,
});

export const buildGrade = (grade: GradeDTO): Grade => ({
  id: grade.id,
  title: grade.title || grade.name,
});

export const buildMyAssignmentsList = (item: DraftAssignmentResponseDTO) => {
  const assignment = isNil(item.assignmentContent) ? undefined : item.assignmentContent;
  const image = (assignment && !isNil(assignment.featuredImage)) ? assignment.featuredImage : undefined;
  const bgImage = (assignment && !isNil(assignment.backgroundImage)) ? assignment.backgroundImage : undefined;

  return new Assignment({
    id: item.id,
    title: item.title,
    questions: assignment ? assignment.questions : [],
    grades: item.grades || [],
    subjects: item.subjects || [],
    isPrivate: item.isPrivate,
    relatedArticles: assignment ? assignment.relatedArticles : [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
    isPublished: item.isPublished,
    isDistributed: item.isDistributed,
    numberOfQuestions: item.numberOfQuestions,
    featuredImage: image,
    isChanged: item.isChanged,
    backgroundImage: bgImage,
    levels: item.levels,
    isCreatedByContentManager: item.createByContentManager,
    grepCoreelements: item.grep_coreelements,
    grepGoals: item.grep_goals,
    grepMaintopic: item.grep_maintopic,
    grepReadingInsubject: item.grep_readinginsubject,
    canEditOrDelete: item.canEditOrDelete
  });
};

export const buildAllAssignmentsList = (item: TeacherAssignmentResponseDTO) => (
    new Assignment({
      id: item.id,
      title: item.title,
      description: item.description,
      hasGuidance: item.hasGuidance || false,
      numberOfQuestions: item.numberOfQuestions,
      grades: item.grades.map(grade => buildGrade(grade)) || [],
      subjects: item.subjects.map(subject => buildSubject(subject)) || [],
      view: item.view,
      featuredImage: item.featuredImage,
      levels: item.levels,
      isCreatedByContentManager: item.createByContentManager,
      isPublished: item.isPublished,
      isDistributed: item.isDistributed,
      grepCoreelements: item.grepCoreelements,
      grepGoals: item.grepGoals,
      grepMaintopic: item.grepMaintopic,
      grepReadingInsubject: item.grepReadinginsubject,
      open: item.open || false,
      canEditOrDelete: item.canEditOrDelete
    })
);

export const buildStudentAssignmentList = (item: StudentAssignmentResponseDTO) => (
  new Assignment({
    id: item.id!,
    title: item.title,
    author: item.author,
    numberOfQuestions: item.numberOfQuestions || 0,
    subjects: item.subjects.map(subject => buildSubject(subject)) || [],
    isAnswered: item.isAnswered,
    deadline: item.endDate,
    featuredImage: isNull(item.featuredImage) ? undefined : item.featuredImage,
    backgroundImage: isNull(item.backgroundImage) ? undefined : item.backgroundImage,
    answerId: isNull(item.answerId) ? undefined : item.answerId,
    isPassed: item.isPassed,
    mark: item.mark,
    status: item.status,
    comment: isNull(item.comment) ? undefined : item.comment,
    isEvaluated: !!item.isEvaluated,
    levels: item.levels,
  })
);

export const buildArticle = (item: ArticleDTO) =>

  new Article({
    id: Number(item.id),
    title: item.title,
    url: item.link,
    excerpt: item.excerpt,
    images: {
      id: Number(item.images.img_id),
      url: item.images.img_url,
      url_large: item.images.img_url_large!,
    },
    grades: item.student_grade.map(grade => buildGrade(grade)) || [],
    subjects: item.student_subject.map(subject => buildSubject(subject)) || [],
    grepCoreelements: item.grep_coreelements,
    grepGoals: item.grep_goals,
    grepMaintopic: item.grep_maintopic,
    levels: item.student_level.length && item.student_level[0] ?
    [
      buildArticleLevel(item.student_level)
    ] : item.level ? [
      new ArticleLevel({
        wpId: item.level.term_id,
        name: item.level.name,
        slug: item.level.slug
      })
    ] :
                    [],

  });

const buildArticleLevel = (levels: Array<StudentLevelDTO>) => (
  new ArticleLevel({
    wpId: levels[0].term_id,
    name: levels[0].name,
    slug: levels[0].slug,
    childArticles: levels[0].childArticles!.map(
                       article => new Article({
                         id: article.id,
                         title: article.title,
                         levels: article.level ? [
                           new ArticleLevel(
                             {
                               wpId: article.level.term_id,
                               name: article.level.name,
                               slug: article.level.slug
                             }
                                                  )
                         ] : []
                       })
                     )
  })
);

export const buildAttachment = (item: AttachmentDTO) => (
  new Attachment(item.id, item.url, item.alt, item.file_name, item.title, item.url_large, item.duration)
);
