import { action, computed, observable } from 'mobx';
import isNull from 'lodash/isNull';

import { injector } from 'Injector';
import { User, UserType } from 'user/User';
import { Teacher } from 'user/teacher/Teacher';

import { USER_SERVICE, UserService } from 'user/UserService';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { ArticleService } from 'assignment/service';
import { ARTICLE_SERVICE_KEY } from 'assignment/Assignment';
import { Locales } from 'utils/enums';

const payload = {};

export class LoginStore {
  private userService: UserService = injector.get<UserService>(USER_SERVICE);
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);
  private wpService: ArticleService = injector.get(ARTICLE_SERVICE_KEY);
  @observable public currentUser: User | null = null;
  @observable public url?: string;
  @observable public isCurrentUserFetching: boolean = false;
  @observable public needRedirect: boolean = false;

  constructor() {
    if (this.storageInteractor.getUser()) {
      this.currentUser = this.storageInteractor.getUser();
    }
  }

  @computed
  public get currentUrl() {
    return this.url;
  }

  @computed
  public get needRedirectToLogin() {
    return this.needRedirect;
  }

  public async getFeideUrl() {
    try {
      this.url = await this.userService.loginWith(payload);
    } catch (e) {
      throw Error(e);
    }
  }

  public async getUserWithToken(code: string) {
    this.isCurrentUserFetching = true;
    this.needRedirect = false;

    const response = await this.userService.getUserWithToken(code);
    if (response && !isNull(response)) {
      this.currentUser = this.storageInteractor.getUser();
    }
    if (isNull(response)) {
      this.needRedirect = true;
    }
    this.isCurrentUserFetching = false;
  }

  public async getUserWithTokenFromLogPass(email: string, password: string) {
    this.isCurrentUserFetching = true;

    const response = await this.userService.getUserWithTokenFromLogPass(email, password);
    if (response) {
      this.currentUser = this.storageInteractor.getUser();
    }

    this.isCurrentUserFetching = false;
  }

  @action
  public async getCurrentUserType(): Promise<string> {
    try {
      const currentUser = this.userService.getCurrentUser();

      if (currentUser instanceof Teacher) {
        return UserType.Teacher;
      }

      return UserType.Student;
    } catch (e) {
      throw Error(`get current user ${e}`);
    }
  }

  @action
  public logOut() {
    this.userService.logOut();
  }

  public getPostID() {
    return this.userService.getPostID();
  }

  public removePostID() {
    this.userService.removePostID();
  }

  public getAssignmentReferralToken() {
    return this.userService.getAssignmentReferralToken();
  }

  public removeAssignmentRefferalToken() {
    this.userService.removeAssignmentReferralToken();
  }

  public getTeachingPathReferralToken() {
    return this.userService.getTeachingPathReferralToken();
  }

  public removeTeachingPathRefferalToken() {
    this.userService.removeTeachingPathReferralToken();
  }

  public getAssignmentId() {
    return this.userService.getAssignmentId();
  }

  public removeAssignmentId() {
    this.userService.removeAssignmentId();
  }

  public getTeachingPathId() {
    return this.userService.getTeachingPathId();
  }

  public removeTeachingPathId() {
    this.userService.removeTeachingPathId();
  }

  public async getLocaleData(locale?: Locales) {
    const currentLocale = this.storageInteractor.getCurrentLocale()!;
    const localeData = await this.wpService.getLocaleData(locale || currentLocale as Locales);

    // FIXME potential bug here if WP will respond with array that contain more than two items
    localeData.forEach((locale) => {
      if (locale.slug.split('_')[0] === 'pll') {
        this.storageInteractor.setTaxonomyLocaleId(locale.id);
      } else {
        this.storageInteractor.setArticlesLocaleId(locale.id);
      }
    });
  }
}
