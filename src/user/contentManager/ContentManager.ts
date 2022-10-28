import { User, UserType, UserParams } from 'user/User';

interface ContentManagerParams extends UserParams {
  email: string;
}

export class ContentManager extends User {
  protected _email: string;

  constructor(params: ContentManagerParams) {
    super({ ...params, type: UserType.ContentManager });
    this._email = params.email;
  }
}
