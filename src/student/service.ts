import { injector } from 'Injector';
import { STUDENT_REPO, StudentRepo } from './api';
import { Filter } from 'user/student/Student';

export const STUDENT_SERVICE = 'STUDENT_SERVICE';

export class StudentService {

  protected studentRepo: StudentRepo = injector.get(STUDENT_REPO);

  public async getStudentsList(filter: Filter) {
    return this.studentRepo.getStudentsList(filter);
  }

  public async changeStudentLevel(studentId: number, level: number) {
    return this.studentRepo.changeStudentLevel(studentId, level);
  }

  public async getStudentAdditionalData() {
    return this.studentRepo.getStudentAdditionalData();
  }
}
