import React, { Component, SyntheticEvent } from 'react';
import intl from 'react-intl-universal';
import { NavLink, withRouter, RouteComponentProps } from 'react-router-dom';
import { inject, observer } from 'mobx-react';

import { CreateButton } from 'components/common/CreateButton/CreateButton';
import { UserType } from 'user/User';
import { LoginStore } from 'user/view/LoginStore';

import './TabNavigation.scss';
import classNames from 'classnames';

interface TabNavigationLink {
  name: string;
  url: string;
  isDisabled?: boolean;
}

interface Props extends RouteComponentProps {
  loginStore?: LoginStore;
  tabNavigationLinks: Array<TabNavigationLink>;
  textMainButton?: string;
  sourceTranslation: string;
  onClickMainButton?(): void;
}

@inject('loginStore')
@observer
class TabNavigationComponent extends Component<Props> {
  public ref = React.createRef<HTMLButtonElement>();

  private mainButton = () => {
    const { textMainButton, onClickMainButton } = this.props;
    return <button className="CreateButton" ref={this.ref} onClick={onClickMainButton}>{textMainButton!}</button>;
  }

  private renderTabNavigationLinks = (link: TabNavigationLink) => (
    <li
      key={link.name}
      className="fw500"
    >
      <NavLink
        className="sidebarLink flexBox alignCenter"
        to={link.url}
        activeClassName="activeRoute"
        onClick={this.preventLinkEvent.bind(this, link.isDisabled)}
        aria-label={intl.get(`${this.props.sourceTranslation}.${link.name}`)}
        role="tab"
      >
        {intl.get(`${this.props.sourceTranslation}.${link.name}`)}
      </NavLink>
    </li>
  )

  private preventLinkEvent(shouldPrevent: boolean | undefined, e: SyntheticEvent) {
    if (shouldPrevent) {
      e.preventDefault();
    }
  }

  public hasButton = () => this.props.loginStore!.currentUser!.type !== UserType.Student && this.props.textMainButton;

  public handleKeyboardControl = (event: KeyboardEvent) => {
    if (event.shiftKey && event.key === 'C' || event.shiftKey && event.key === 'c') {
      if (this.props.loginStore!.currentUser!.type !== UserType.Student && this.props.textMainButton) {
        this.ref.current!.click();
      }
    }
  }

  public async componentDidMount() {
    document.addEventListener('keyup', this.handleKeyboardControl);
  }
  public componentWillUnmount() {
    document.removeEventListener('keyup', this.handleKeyboardControl);
  }

  public render() {
    const { tabNavigationLinks } = this.props;

    const classes = classNames('TabNavigation flexBox spaceBetween alignCenter', {
      TabNavigation_noMargin: !this.hasButton(),
    });

    return (
      <nav className={classes}>
        <div className="menu-list">
          <ul className="flexBox nav-tabs">
            {tabNavigationLinks.map(this.renderTabNavigationLinks)}
          </ul>
        </div>

        {this.hasButton() && this.mainButton()}
      </nav>
    );
  }

}

export const TabNavigation = withRouter(TabNavigationComponent);
