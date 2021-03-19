import { User, UserType, UserParams } from 'user/User';

export class Teacher extends User {
  constructor(params: UserParams) {
    super({ ...params, type: UserType.Teacher });
  }
}
