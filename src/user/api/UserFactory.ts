import { UserDTO, StudentDTO } from './UserApi';
import { User, UserType } from 'user/User';
import { Teacher } from 'user/teacher/Teacher';
import { Student } from 'user/student/Student';
import { ContentManager } from 'user/contentManager/ContentManager';

export const buildUser = (dto: UserDTO & StudentDTO): User => {
  switch (dto.role) {
    case UserType.Teacher:
      return new Teacher({
        id: dto.id,
        name: dto.name,
        photo: dto.photo,
        schools: dto.schools,
        is_super_cm: dto.is_super_cm,
      });
    case UserType.Student:
      return new Student({
        id: dto.id,
        name: dto.name,
        photo: dto.photo,
        schools: dto.schools,
        is_super_cm: dto.is_super_cm,
      });
    case UserType.ContentManager:
      return new ContentManager({
        id: dto.id,
        name: dto.name,
        photo: dto.photo,
        email: dto.email || '',
        schools: dto.schools,
        is_super_cm: dto.is_super_cm,
      });
    default:
      throw new TypeError(`Unknown user: ${dto.role}`);
  }
};
