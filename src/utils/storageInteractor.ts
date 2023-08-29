import { User } from 'user/User';
import { buildUser } from 'user/api/UserFactory';

const USER_TOKEN = 'USER_TOKEN';
const USER_DATA = 'USER_DATA';
const CURRENT_LOCALE = 'currentLocale';
const POST_ID = 'postID';
const ASSIGNMENT_REFERRAL_TOKEN = 'assignmentReferralToken';
const ASSIGNMENT_ID = 'assignmentId';
const TEACHING_PATH_REFERRAL_TOKEN = 'teachingPathReferralToken';
const TEACHING_PATH_ID = 'teachingPathId';
const ARTICLES_LOCALE_ID = 'articlesLocaleId';
const TAXONOMY_LOCALE_ID = 'taxonomyLocaleId';
const REDIRECTURL = 'REDIRECTURL';

export const STORAGE_INTERACTOR_KEY = 'STORAGE_INTERACTOR_KEY';

export class StorageInteractor {
  public setUserWithToken(token: string, user: Object) {
    localStorage.setItem(USER_TOKEN, token);
    localStorage.setItem(USER_DATA, JSON.stringify(user));
  }

  public setUrlAfterLogin(url: string) {
    localStorage.setItem(REDIRECTURL, url);
  }

  public getUrlAfterLogin() {
    localStorage.getItem(REDIRECTURL);
  }

  public getUser(): User | null {
    const userDTO = localStorage.getItem(USER_DATA);
    if (!userDTO) {
      return null;
    }

    return buildUser(JSON.parse(userDTO));
  }

  public getToken() {
    return localStorage.getItem(USER_TOKEN);
  }

  public getUserRole() {
    const currentUser = JSON.parse(localStorage.getItem(USER_DATA)!);
    return currentUser.role;
  }

  public logOut() {
    localStorage.removeItem(USER_TOKEN);
    localStorage.removeItem(USER_DATA);
  }

  public getCurrentLocale() {
    return localStorage.getItem(CURRENT_LOCALE);
  }

  public getPostID() {
    return Number(localStorage.getItem(POST_ID));
  }

  public setPostID(postID: number) {
    localStorage.setItem(POST_ID, String(postID));
  }

  public removePostID() {
    localStorage.removeItem(POST_ID);
  }

  public getAssignmentReferralToken() {
    return localStorage.getItem(ASSIGNMENT_REFERRAL_TOKEN) || '';
  }

  public setAssignmentReferralToken(referralToken: string) {
    localStorage.setItem(ASSIGNMENT_REFERRAL_TOKEN, referralToken);
  }

  public removeAssignmentReferralToken() {
    localStorage.removeItem(ASSIGNMENT_REFERRAL_TOKEN);
  }

  public getTeachingPathReferralToken() {
    return localStorage.getItem(TEACHING_PATH_REFERRAL_TOKEN) || '';
  }

  public setTeachingPathReferralToken(referralToken: string) {
    localStorage.setItem(TEACHING_PATH_REFERRAL_TOKEN, referralToken);
  }

  public removeTeachingPathReferralToken() {
    localStorage.removeItem(TEACHING_PATH_REFERRAL_TOKEN);
  }

  public getAssignmentId() {
    return localStorage.getItem(ASSIGNMENT_ID) || '';
  }

  public setAssignmentId(assignmentId: string) {
    localStorage.setItem(ASSIGNMENT_ID, assignmentId);
  }

  public removeAssignmentId() {
    localStorage.removeItem(ASSIGNMENT_ID);
  }

  public getTeachingPathId() {
    return localStorage.getItem(TEACHING_PATH_ID) || '';
  }

  public setTeachingPathId(teachingPathId: string) {
    localStorage.setItem(TEACHING_PATH_ID, teachingPathId);
  }

  public removeTeachingPathId() {
    localStorage.removeItem(TEACHING_PATH_ID);
  }

  public getArticlesLocaleId() {
    return localStorage.getItem(ARTICLES_LOCALE_ID);
  }

  public getTaxonomyLocaleId() {
    return localStorage.getItem(TAXONOMY_LOCALE_ID);
  }

  public setArticlesLocaleId(locale: string) {
    localStorage.setItem(ARTICLES_LOCALE_ID, locale);
  }

  public setTaxonomyLocaleId(locale: string) {
    localStorage.setItem(TAXONOMY_LOCALE_ID, locale);
  }
}
