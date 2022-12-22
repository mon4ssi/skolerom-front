import { RecentActivity } from './Activity';
import { RecentActivityDTO } from './api';
import { buildGrade, buildSubject, TeacherAssignmentResponseDTO } from '../assignment/factory';
import { Assignment, Grade } from '../assignment/Assignment';
import { TeacherTeachingPathResponseDTO } from '../teachingPath/api';
import { TeachingPath } from '../teachingPath/TeachingPath';
import isNil from 'lodash/isNil';

export const buildRecentActivity = (dto: RecentActivityDTO) => (
  new RecentActivity(dto)
);

export const buildNewestAssignments = (dto: Array<TeacherAssignmentResponseDTO>) => (
  dto.map((item: TeacherAssignmentResponseDTO) => new Assignment({
    id: item.id,
    title: item.title,
    description: item.description,
    numberOfQuestions: item.numberOfQuestions,
    grades: item.grades.map(grade => buildGrade(grade)) || [],
    subjects: item.subjects.map(subject => buildSubject(subject)) || [],
    view: item.view,
    featuredImage: item.featuredImage,
    levels: item.levels,
    isCreatedByContentManager: item.createByContentManager
  })));

export const buildNewestTeachingPaths = (dto: Array<TeacherTeachingPathResponseDTO>) => (
  dto.map((item: TeacherTeachingPathResponseDTO) => new TeachingPath({
    id: item.id,
    title: item.title,
    featuredImage: item.featuredImage,
    description: item.description,
    grades: isNil(item.grades) ? undefined : item.grades.map(grade => new Grade(grade.id, grade.title)),
    view: item.view,
    levels: item.levels,
    canEditOrDelete: item.canEditOrDelete
  })));
