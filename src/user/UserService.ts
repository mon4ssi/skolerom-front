import { injector } from 'Injector';
import { UserRepo, USER_REPO, User, UserType } from 'user/User';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';

export const USER_SERVICE = 'USER_SERVICE';

// tslint:disable-next-line: no-empty-interface
export interface LoginPayload {}

export class FeideLoginPayload implements LoginPayload {}

export class UserService {
  private userRepo = injector.get<UserRepo>(USER_REPO);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private currentUser: User | null = null;
  private currentUserType: UserType | null = null;

  public async getUserWithToken(token: string): Promise<string | null> {
    return this.userRepo.getUserWithToken(token);
  }

  public async getUserWithTokenFromLogPass(
    email: string,
    password: string
  ): Promise<string> {
    return this.userRepo.getUserWithTokenFromLogPass(email, password);
  }

  public getCurrentUser(): User | null {
    if (!this.currentUser) {
      this.currentUser = this.storageInteractor.getUser();
    }

    return this.currentUser;
  }

  public async loginWith(payload: LoginPayload) {
    return this.userRepo.loginWith(payload);
  }

  public logOut() {
    this.userRepo.logOut();
  }

  public getCurrentLocale() {
    return this.storageInteractor.getCurrentLocale();
  }

  public getPostID() {
    return this.storageInteractor.getPostID();
  }

  public setPostID(postID: number) {
    this.storageInteractor.setPostID(postID);
  }

  public removePostID() {
    this.storageInteractor.removePostID();
  }

  public getAssignmentReferralToken() {
    return this.storageInteractor.getAssignmentReferralToken();
  }

  public setAssignmentReferralToken(referralToken: string) {
    this.storageInteractor.setAssignmentReferralToken(referralToken);
  }

  public removeAssignmentReferralToken() {
    this.storageInteractor.removeAssignmentReferralToken();
  }

  public getTeachingPathReferralToken() {
    return this.storageInteractor.getTeachingPathReferralToken();
  }

  public setTeachingPathReferralToken(referralToken: string) {
    this.storageInteractor.setTeachingPathReferralToken(referralToken);
  }

  public removeTeachingPathReferralToken() {
    this.storageInteractor.removeTeachingPathReferralToken();
  }

  public getAssignmentId() {
    return this.storageInteractor.getAssignmentId();
  }

  public setAssignmentId(assignemntId: string) {
    this.storageInteractor.setAssignmentId(assignemntId);
  }

  public removeAssignmentId() {
    this.storageInteractor.removeAssignmentId();
  }

  public getTeachingPathId() {
    return this.storageInteractor.getTeachingPathId();
  }

  public setTeachingPathId(teachingPathId: string) {
    this.storageInteractor.setTeachingPathId(teachingPathId);
  }

  public removeTeachingPathId() {
    this.storageInteractor.removeTeachingPathId();
  }
}
