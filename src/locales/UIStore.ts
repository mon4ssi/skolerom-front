import { observable, action, computed } from 'mobx';

import { injector } from 'Injector';
import { UserService, USER_SERVICE } from 'user/UserService';

export class UIStore {
  private userService: UserService = injector.get<UserService>(USER_SERVICE);

  @observable private _currentLocale: string = '';
  @observable private _currentFont: string = '';
  @observable private _sidebarShown: boolean = false;
  @observable private _currentActiveTab: string = 'activity';

  public get currentLocale() {
    return this._currentLocale;
  }

  public get currentFont() {
    return this._currentFont;
  }

  public get sidebarShown() {
    return this._sidebarShown;
  }

  @computed
  public get currentActiveTab() {
    return this._currentActiveTab;
  }

  @action
  public setCurrentLocale(locale: string): void {
    this._currentLocale = locale;
    localStorage.setItem('currentLocale', locale);
  }

  @action
  public setCurrentFont(font: string): void {
    this._currentFont = font;
    localStorage.setItem('currentFont', font);
  }

  @action
  public toggleSidebar: () => void = () => {
    this._sidebarShown = !this.sidebarShown;
  }

  @action
  public hideSidebar: () => void = () => {
    this._sidebarShown = false;
  }

  @action
  public setCurrentActiveTab(activeTab: string) {
    this._currentActiveTab = activeTab;
  }
}
