import { StudentGradeSubject, Student, Filter, StudentLevel } from 'user/student/Student';

import { API } from 'utils/api';
import { buildStudentsList, buildStudentFilterDTO, buildAdditionalData } from './factory';
import { Grade, Subject } from 'assignment/Assignment';
import { GradeDTO, SubjectDTO } from 'assignment/factory';

export const STUDENT_REPO = 'STUDENT_REPO';

export interface StudentRepo {
  getStudentsList(filter: Filter): Promise<{ students: Array<Student>, total_pages: number }>;
  changeStudentLevel(studentId: number, levelId: number): Promise<void>;
  getStudentAdditionalData(): Promise<{
    grades: Array<Grade>;
    subjects: Array<Subject>;
    levels: Array<StudentLevel>;
  }>;
}

export interface LevelDTO {
  id: number;
  wpId: number;
  graduation: number;
}

export interface StudentResponseDTO {
  id: number;
  name: string;
  subjects: Array<StudentGradeSubject>;
  grades: Array<StudentGradeSubject>;
  level: LevelDTO;
}

export interface StudentAdditionalDataResponseDTO {
  grades: Array<GradeDTO>;
  subjects: Array<SubjectDTO>;
  levels: Array<LevelDTO>;
}

export class StudentApi implements StudentRepo {

  public async getStudentsList(filter: Filter) {
    const response = await API.get(
      'api/teacher/students',
      { params: buildStudentFilterDTO(filter) }
    );

    return {
      students: buildStudentsList(response.data.data),
      total_pages: response.data.meta.pagination.total_pages
    };
  }

  public async changeStudentLevel(studentId: number, levelId: number) {
    await API.post(
      'api/teacher/students/assign-level',
      {
        studentId,
        levelId
      }
    );
  }

  public async getStudentAdditionalData() {
    const response = await API.get('api/teacher/students/additional-data');

    return buildAdditionalData(response.data);
  }
}
