import { School } from 'distribution/Distribution';
import { LoginPayload } from './UserService';

export const USER_REPO = 'USER_REPO';

export interface UserRepo {
  getFeideLoginUrl(): Promise<string>;
  getUserWithToken(code: string): Promise<string | null>;
  loginWith(payload: LoginPayload): Promise<string>;
  getUserWithTokenFromLogPass(email: string, password: string): Promise<string>;
  logOut(): Promise<void>;
}

export enum UserType {
  Teacher = 'TEACHER',
  Student = 'STUDENT',
  ContentManager = 'CONTENT-MANAGER',
  SuperContentManager = 'SUPER-CM'
}

export type UserParams = {
  id: number;
  name: string;
  photo: string;
  schools: Array<School>;
  isSuperCM?: boolean;
  teacherTrial?: boolean;
  isTestAccount?: boolean;
};

export abstract class User {
  public readonly type: UserType;
  public readonly name: string;
  public readonly id: number;
  public readonly photo: string;
  public readonly schools: Array<School>;
  public readonly isSuperCM?: boolean;
  public readonly teacherTrial?: boolean;
  public readonly isTestAccount?: boolean;

  protected constructor(params: UserParams & { type: UserType }) {
    this.type = params.type;
    this.id = params.id;
    this.name = params.name;
    this.photo = params.photo;
    this.schools = params.schools;
    this.isSuperCM = params.isSuperCM;
    this.teacherTrial = params.teacherTrial;
    this.isTestAccount = params.isTestAccount;
  }
}
