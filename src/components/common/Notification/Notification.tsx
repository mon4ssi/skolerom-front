import React, { Component, MouseEvent, createRef } from 'react';
import ReactDOM from 'react-dom';
import isFunction from 'lodash/isFunction';
import { Animated } from 'react-animated-css';
import classnames from 'classnames';
import intl from 'react-intl-universal';

import confirmImg from 'assets/images/notification-confirm.svg';
import successImg from 'assets/images/notification-success.svg';
import errorImg from 'assets/images/notification-error.svg';
import closeImg from 'assets/images/close.svg';

import './Notification.scss';

const showDelay = 5000;
const animationInDuration = 300;
const animationOutDuration = 500;

export enum NotificationTypes {
  CONFIRM,
  SUCCESS,
  ERROR
}

export type Props = {
  type: NotificationTypes;
  title: string;
  isTitleHTML?: boolean;
  hideIcon?: boolean;
  submitButtonTitle?: string;
  cancelButtonTitle?: string;
  onSubmitClick?(): void;
  onCancelClick?(): void;
  onHide?(): void;
  onRender?(instance: Notification): void;
};

export type State = {
  isOpen: boolean;
  isAnimated: boolean;
};

// USE ASYNC/AWAIT FOR TYPE === NotificationTypes.CONFIRM
export class Notification extends Component<Props, State> {
  public ref = createRef<HTMLButtonElement>();

  public state = {
    isOpen: false,
    isAnimated: true,
  };

  public resolve?: (value?: any | boolean | PromiseLike<boolean> | undefined) => void;

  public componentDidMount = () => {
    const { type } = this.props;
    if (type === NotificationTypes.CONFIRM) {
      this.ref.current!.focus();
    }
    if (
      type === NotificationTypes.SUCCESS ||
      type === NotificationTypes.ERROR
    ) {
      setTimeout(
        () => {
          if (this.state.isOpen) {
            this.handleHideDialog();
          }
        },
        showDelay
      );
    }
  }

  public static create = async (props: Props) => {
    const createDialog = async (props: Props) => {
      const { onHide, ...rest } = props;

      return new Promise<Notification>((resolve) => {
        const container = document.getElementById('notifications');
        const div = document.createElement('div');
        const rootDiv = document.getElementById('root');
        container!.appendChild(div);

        if (props.type === NotificationTypes.CONFIRM) {
          rootDiv!.classList.add('disabledArea');
        }

        const destroy = () => {
          ReactDOM.unmountComponentAtNode(div);
          if (container!.contains(div)) {
            container!.removeChild(div);
          }
        };

        ReactDOM.render(
          <Notification {...rest} onRender={resolve} onHide={destroy} />,
          div
        );
      });
    };

    return (await createDialog(props)).show();
  }
  public handleShowDialog = () => {
    this.setState({
      isOpen: true,
    });
  }

  public handleHideDialog = () => {
    if (this.props.type === NotificationTypes.CONFIRM) {
      const rootDiv = document.getElementById('root');
      rootDiv!.classList.remove('disabledArea');
    }

    this.setState({
      isAnimated: false
    });

    setTimeout(
      () => {
        this.setState({
          isOpen: false
        });
        this.props.onHide!();
      },
      animationOutDuration + 1
    );
  }

  public handleCancelClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (this.props.onCancelClick) {
      this.props.onCancelClick();
    }
    this.resolve!(false);
    this.handleHideDialog();
  }

  public handleSubmitClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (this.props.onSubmitClick) {
      this.props.onSubmitClick();
    }
    this.resolve!(true);
    this.handleHideDialog();
  }

  public show = async () => {
    this.handleShowDialog();
    return new Promise<boolean>((resolve) => {
      this.resolve = resolve;
    });
  }

  public forwardRef: React.ClassAttributes<Animated>['ref'] = () => {
    const { onRender } = this.props;
    if (!isFunction(onRender)) {
      return;
    }
    onRender(this);
  }

  public onCloseIconClick = (e: MouseEvent<HTMLImageElement>) => {
    e.preventDefault();

    this.handleHideDialog();
  }

  public renderIcon = () => {
    const { type } = this.props;

    const image = type === NotificationTypes.CONFIRM ? confirmImg :
      type === NotificationTypes.SUCCESS ? successImg :
      errorImg;

    return (
      <img className="Notification_icon" src={image} alt="icon" />
    );
  }

  public renderTitle = () => {
    const { title, isTitleHTML } = this.props;

    if (isTitleHTML) {
      return (
        <p className="Notification_title" dangerouslySetInnerHTML={{ __html: title }} />
      );
    }

    return (
      <p className="Notification_title">{title}</p>
    );
  }

  public renderCloseIcon = () => (
    <img
      src={closeImg}
      alt={intl.get('generals.close')}
      title={intl.get('generals.close')}
      onClick={this.onCloseIconClick}
      className="Notification_close"
    />
  )

  public renderFooter = () => {
    const {
      submitButtonTitle = intl.get('notifications.ok'),
      cancelButtonTitle = intl.get('notifications.cancel')
    } = this.props;
    return (
      <footer className="Notification_footer">
        <button className="Notification_submit" title={intl.get('notifications.ok')} ref={this.ref} onClick={this.handleSubmitClick}>{submitButtonTitle}</button>
        <button className="Notification_cancel" title={intl.get('notifications.cancel')} onClick={this.handleCancelClick}>{cancelButtonTitle}</button>
      </footer>
    );
  }

  public render() {
    const { type, hideIcon } = this.props;

    const { isAnimated } = this.state;

    const containerClassnames = classnames(
      type === NotificationTypes.CONFIRM && 'Notification_container__confirm',
      type === NotificationTypes.SUCCESS && 'Notification_container__success',
      type === NotificationTypes.ERROR && 'Notification_container__error'
    );

    return (
        <Animated
          animationIn="fadeInRight"
          animationOut="fadeOutRight"
          isVisible={isAnimated}
          animationInDuration={animationInDuration}
          animationOutDuration={animationOutDuration}
          className={containerClassnames}
          ref={this.forwardRef}
        >
          <section className="Notification_content">
            {!hideIcon! && this.renderIcon()}
            {this.renderTitle()}
            {this.renderCloseIcon()}
          </section>

          {type === NotificationTypes.CONFIRM && this.renderFooter()}
        </Animated>
    );
  }
}
