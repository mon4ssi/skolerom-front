import { StudentResponseDTO, LevelDTO, StudentAdditionalDataResponseDTO } from './api';
import { Student, Filter, StudentLevel } from 'user/student/Student';
import { buildGrade, buildSubject } from 'assignment/factory';

const buildLevel = (dto: LevelDTO) => new StudentLevel({
  id: dto.id,
  wpId: dto.wpId,
  graduation: dto.graduation
});

export const buildAdditionalData = (dto: StudentAdditionalDataResponseDTO) => ({
  grades: dto.grades.map(buildGrade),
  subjects: dto.subjects.map(buildSubject),
  levels: dto.levels.map(buildLevel)
});

const buildStudent = (dto: StudentResponseDTO) => (
  new Student({
    id: dto.id,
    name: dto.name,
    photo: '',
    grades: dto.grades,
    subjects: dto.subjects,
    level: buildLevel(dto.level)
  })
);

export const buildStudentsList = (dto: Array<StudentResponseDTO>) => (
  dto.map(
    student => buildStudent(student)
  )
);

export const buildStudentFilterDTO = (filter: Filter) => {
  const filterDTO: { [key: string]: string | number } = {};

  if (filter.page) {
    filterDTO.page = filter.page;
  }

  if (filter.per_page) {
    filterDTO.per_page = filter.per_page;
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

  return filterDTO;
};
