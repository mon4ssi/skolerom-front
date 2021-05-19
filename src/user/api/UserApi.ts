import { UserRepo, UserType } from 'user/User';
import { API } from 'utils/api';
import { injector } from 'Injector';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import intl from 'react-intl-universal';

import { LoginPayload } from 'user/UserService';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { STATUS_NOT_FOUND, STATUS_SERVER_ERROR } from '../../utils/constants';

export interface UserDTO {
  role: UserType;
  name: string;
  id: number;
  photo: string;
  email?: string;
}

export interface StudentDTO {
  grade: string;
}

export class UserApi implements UserRepo {
  private storageInteractor = injector.get<StorageInteractor>(STORAGE_INTERACTOR_KEY);

  private async loginWithFeide() {
    return this.getFeideLoginUrl();
  }

  public async getFeideLoginUrl(): Promise<string> {
    const response = await API.get('/api/login/dataporten');
    return response.data.dataportenLoginUrl;
  }

  public async getUserWithToken(code: string): Promise<string | null> {
    try {
      const response = await API.post('/api/login/dataporten/authorize', { code }, { withCredentials: true });

      this.storageInteractor.setUserWithToken(response.data.access_token, response.data.user);
      return response.data.access_token;
    } catch (error) {
      if (error.response.status === STATUS_NOT_FOUND || error.response.status === STATUS_SERVER_ERROR) {
        Notification.create({
          type: NotificationTypes.ERROR,
          title: intl.get('login_page.not permission')
        });
        return null;
      }
      throw new Error(error);
    }
  }

  public async getUserWithTokenFromLogPass(email: string, password: string) {
    try {
      const response = await API.post('/api/login', { email, password }, { withCredentials: true });

      if (response.data.access_token === 'login_wp') {
        window.location.href = `${process.env.REACT_APP_WP_URL}/wp-content/plugins/skolerom-sso/skolerom-sso-login.php?nl=1&sso=${response.data.sso}`;
        return 'login_wp';
      }

      this.storageInteractor.setUserWithToken(response.data.access_token, response.data.user);

      return response.data.access_token;
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.response.data.message
      });
    }
  }

  public async loginWith(payload: LoginPayload): Promise<string> {
    // if (payload instanceof FeideLoginPayload) {
    return this.loginWithFeide();
    // }
  }

  public async logOut() {
    const currentUserRole = this.storageInteractor.getUserRole();

    const { data } = await API.get('/api/logout', { withCredentials: true });
    this.storageInteractor.logOut();

    if (currentUserRole === UserType.ContentManager) {
      window.location.href = `${process.env.REACT_APP_WP_URL}`;
    } else {
      window.location.href = 'https://auth.dataporten.no/openid/endsession?' +
      `post_logout_redirect_uri=${encodeURIComponent(data.post_logout_redirect_uri)}&id_token_hint=${data.id_token}`;

    }
  }
}
