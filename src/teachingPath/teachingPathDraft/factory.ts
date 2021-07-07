import intl from 'react-intl-universal';
import isNil from 'lodash/isNil';

import { DraftTeachingPath, EditableTeachingPathNode } from './TeachingPathDraft';
import { TeachingPathItem, TeachingPathNode, TeachingPathNodeType } from '../TeachingPath';
import { DraftTeachingPathResponseDTO, TeachingPathItemSaveResponseDTO, TeachingPathNodeSaveResponseDTO } from './api';
import { TeachingPathNodeResponseDTO } from 'teachingPath/api';
import { Article, Assignment, Grade, Subject, Domain } from 'assignment/Assignment';

export const buildNewTeachingPath = (dto: DraftTeachingPathResponseDTO) => {
  const draftTeachingPath = new DraftTeachingPath({
    id: dto.id,
    title: '',
    content: null,
    sessionId: dto.uuid,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    publishedAt: dto.publishedAt,
  });

  draftTeachingPath.setContent(
    buildEditableNode(buildNewRootDraftTeachingPathNodeArgs, draftTeachingPath)
  );

  return draftTeachingPath;
};

const buildNewRootDraftTeachingPathNodeArgs = {
  type: TeachingPathNodeType.Root,
  selectQuestion: intl.get('edit_teaching_path.paths.main_teaching_path_title'),
  items: [],
  children: [],
};

const buildEditableNode = (
  dto: TeachingPathNodeResponseDTO,
  draftTeachingPath: DraftTeachingPath
): EditableTeachingPathNode => new EditableTeachingPathNode({
  ...dto,
  draftTeachingPath,
});

export const buildDraftTeachingPath = (dto: DraftTeachingPathResponseDTO) => {
  const draftTeachingPath = new DraftTeachingPath({
    id: dto.id,
    title: dto.title!,
    description: dto.description,
    isPrivate: dto.isPrivate,
    content: null,
    sessionId: dto.uuid,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    publishedAt: dto.publishedAt,
    grades: dto.grades ? dto.grades.map(grade => new Grade(grade.id, grade.title)) : [],
    subjects: dto.subjects ? dto.subjects.map(subject => new Subject(subject.id, subject.title)) : [],
    levels: dto.levels,
    ownedByMe: dto.ownedByMe,
    isCopy: dto.isCopy,
  });

  draftTeachingPath.setContent(buildEditableNode(dto.content!, draftTeachingPath));

  return draftTeachingPath;
};

export const buildArrayAllWpIds = (draftTeachingPath: DraftTeachingPath) => {
  const array: Array<number> = [];

  const getWpIds = (children: Array<TeachingPathNode>) => {
    children.forEach((child) => {
      if (child.items) {
        child.items.forEach((item) => {
          if (item.type === TeachingPathNodeType.Article) {
            const value = item.value as Article;
            array.push(value.wpId!);
          }
        });
      }

      if (child.children && child.children.length > 0) {
        getWpIds(child.children);
      }
    });

    return array;
  };

  if (draftTeachingPath.content.children) {
    return getWpIds(draftTeachingPath.content.children);
  }
  return [];
};

const buildArticleItemDTO = (
  item: Article
) => ({
  id: item.id,
  wpId: item.id,
  title: item.title,
  grades: item.grades || [],
  excerpt: item.excerpt,
  url: item.url,
  images: item.images,
  levels: item.levels,
  grepCoreelements: item.grepCoreelements,
  grepGoals: item.grepGoals,
  grepMaintopic: item.grepMaintopic
});

const buildAssignmentItemDTO = (
  item: Assignment
) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  grades: item.grades,
  levels: item.levels,
  numberOfQuestions: item.numberOfQuestions,
  relatedArticles: item.relatedArticles,
  featuredImage: item.featuredImage
});

const buildDomainItemDTO = (
  item: Domain
) => ({
  id: item.id,
  title: item.title,
  description: item.description,
  grades: item.grades || [],
  url: item.url,
  featuredImage: item.featuredImage
});

const buildTeachingPathItemRequestDTO = (item: TeachingPathItem): TeachingPathItemSaveResponseDTO => {
  if (item.type === TeachingPathNodeType.Article) {
    return buildArticleItemDTO(item.value as Article);
  }
  if (item.type === TeachingPathNodeType.Assignment) {
    return buildAssignmentItemDTO(item.value as Assignment);
  }
  if (item.type === TeachingPathNodeType.Domain) {
    return buildDomainItemDTO(item.value as Domain);
  }
  return buildArticleItemDTO(item.value as Article);
};

const buildImageUrlFromArticlesOrAssignment = (child: TeachingPathNodeSaveResponseDTO) => {
  if (child.type === TeachingPathNodeType.Article) {
    const itemWithImage = child.items!.find((item: TeachingPathItemSaveResponseDTO) => !isNil(item.images) && !isNil(item.images.url));
    if (itemWithImage) {
      return itemWithImage.images!.url;
    }
  }
  if (child.type === TeachingPathNodeType.Assignment) {
    const itemWithImage = child.items!.find((item: TeachingPathItemSaveResponseDTO) => !isNil(item.featuredImage));
    if (itemWithImage) {
      return itemWithImage.featuredImage;
    }
  }
};

export const buildFeatureImageForTeachingPathRequestDTO = (data: TeachingPathNodeSaveResponseDTO): string | undefined => {
  let image = undefined;

  data.children.find((child: TeachingPathNodeSaveResponseDTO) => {
    if (child.items && child.items.length > 0) {
      const imageUrl = buildImageUrlFromArticlesOrAssignment(child);
      if (!isNil(imageUrl) && imageUrl !== '') {
        return image = imageUrl;
      }
      if (child.children && child.children.length > 0) {
        image = buildFeatureImageForTeachingPathRequestDTO(child);
      }
    }
    return undefined;
  });
  return image;
};

const buildTeachingPathNodeRequestDTO = (content: EditableTeachingPathNode): TeachingPathNodeSaveResponseDTO => ({
  type: content.type,
  selectQuestion: content.selectQuestion,
  items: content.items ? content.items.map(item => buildTeachingPathItemRequestDTO(item)) : [],
  children: content.children.map(child => buildTeachingPathNodeRequestDTO(child))
});

const buildGrade = (grades: Array<Grade>) =>
  grades.map(grade => ({
    id: grade.id,
    title: grade.title
  }));

const buildSubject = (subjects: Array<Subject>) =>
  subjects.map(subject => ({
    id: subject.id,
    title: subject.title
  }));

export const buildTeachingPathRequestDTO = (teachingPath: DraftTeachingPath) => ({
  uuid: teachingPath.uuid!,
  title: teachingPath.title,
  description: teachingPath.description,
  isPrivate: teachingPath.isPrivate,
  content: buildTeachingPathNodeRequestDTO(teachingPath.content),
  grades: buildGrade(teachingPath.grades),
  subjects: buildSubject(teachingPath.subjects),
  levels: teachingPath.levels,
  isCopy: teachingPath.isCopy,
});
