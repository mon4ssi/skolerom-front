import React, { Component, Ref, SyntheticEvent } from 'react';
import onClickOutside from 'react-onclickoutside';
import CopyToClipboard from 'react-copy-to-clipboard';
import intl from 'react-intl-universal';

interface Props {
  reference: Ref<HTMLUListElement>;
  hideMenu(): void;
}

class RightClickMenuComponent extends Component<Props> {

  public rightClickMenu = (e: SyntheticEvent) => {
    e.stopPropagation();
  }

  public handleClickOutside = () => {
    this.props.hideMenu();
  }

  public closeMenu = () => {
    this.props.hideMenu();
  }

  public render() {
    return (
      <ul className="rightClickMenu" ref={this.props.reference} onClick={this.rightClickMenu}>
        <CopyToClipboard text={`${process.env.REACT_APP_BASE_URL}/dataporten/auth`}>
          <li id="l1" onClick={this.closeMenu}>
            {intl.get('login_page.Copy url')}
          </li>
        </CopyToClipboard>
      </ul>
    );
  }
}

export const RightClickMenu = onClickOutside(RightClickMenuComponent);
