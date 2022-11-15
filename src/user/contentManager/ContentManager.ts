import { User, UserType, UserParams } from 'user/User';

interface ContentManagerParams extends UserParams {
  email: string;
  isTestAccount: boolean;
}

export class ContentManager extends User {
  protected _email: string;
  protected _isTestAccount: boolean;

  constructor(params: ContentManagerParams) {
    super({ ...params, type: UserType.ContentManager });
    this._email = params.email;
    this._isTestAccount = params.isTestAccount;
  }
}
