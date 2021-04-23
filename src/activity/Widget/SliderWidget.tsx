import React, { Component } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import isEqual from 'lodash/isEqual';
import classNames from 'classnames';
import intl from 'react-intl-universal';

import { WidgetHeader } from './Core/WidgetHeader';
import { SliderWidgetDomain } from '../Activity';
import { SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE } from 'utils/constants';
import { ContentWrapper } from './Core/ContentWrapper';
import { SliderButtonBehavior, StoreState } from 'utils/enums';

import './SliderWidget.scss';

interface SliderWidgetProps {
  state: StoreState;
  widget?: SliderWidgetDomain;
  onPopup: (url: string) => void;
}

interface SliderWidgetState {
  currentSlide: number;
  isUpdated: boolean;
  isRunning: boolean;
  isVisibleContent: boolean;
  isPause: boolean;
}

const ANIMATION_TIMEOUT = 500;

export class SliderWidget extends Component<SliderWidgetProps, SliderWidgetState> {

  private timer: number = 0;
  public state = {
    currentSlide: 0,
    isUpdated: false,
    isRunning: false,
    popupShown: false,
    iframeURL: '',
    isVisibleContent: true,
    isPause: false
  };

  private start(startingSlide: number) {
    this.setState({
      currentSlide: startingSlide,
      isRunning: true,
    });

    const timeTilNextSlide = this.props.widget
      ? this.props.widget.slides[startingSlide].timeTilNextSlide
      : SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE;
    if (!this.state.isPause) {
      this.startTimer(timeTilNextSlide, startingSlide + 1);
    }
  }

  private stop() {
    window.clearTimeout(this.timer);
    this.setState({
      currentSlide: 0,
      isRunning: false,
    });
  }

  private pause(currentSlide: number) {
    if (this.props.widget) {
      window.clearTimeout(this.timer);
      if (!this.state.isPause) {
        this.setState({
          isPause: true
        });
      } else {
        this.setState({
          isPause: false
        });
        const timeTilNextSlide = this.props.widget
        ? this.props.widget.slides[currentSlide].timeTilNextSlide
        : SLIDER_WIDGET_TIME_TIL_NEXT_SLIDE;
        this.startTimer(timeTilNextSlide, currentSlide + 1);
      }
    }
  }

  private startTimer(time: number, nextSlide: number) {
    window.clearTimeout(this.timer);
    this.timer = window.setTimeout(
      () => {
        this.performUpdate(nextSlide);
      },
      time
    );
  }

  private performUpdate(currentSlide: number) {
    if (this.props.widget) {
      if (this.props.widget.slides.length > currentSlide && !this.state.isUpdated) {
        this.setState({
          currentSlide,
        });

        this.startTimer(this.props.widget.slides[currentSlide].timeTilNextSlide, currentSlide + 1);
      } else {
        this.setState({
          currentSlide: 0,
          isUpdated: false,
        });

        this.startTimer(this.props.widget.slides[0].timeTilNextSlide, 1);
      }
    } else {
      this.stop();
    }
  }

  private openSlide(url: string, buttonBehavior: SliderButtonBehavior) {
    switch (buttonBehavior) {
      case SliderButtonBehavior.POPUP:
        this.props.onPopup(url);
        break;
      case SliderButtonBehavior.CURRENT_TAB:
        document.location.assign(url);
        break;
      case SliderButtonBehavior.NEW_TAB:
      default:
        window.open(url);
        break;
    }
  }

  private renderContent() {
    if (this.props.widget) {
      const slide = this.props.widget.slides[this.state.currentSlide];
      if (slide) {
        const imageClasses = classNames('SliderWidget__image', {
          SliderWidget__image_animated: slide.hasZoomOutAnimation && this.state.isVisibleContent,
          SliderWidget__image_animatedCollapsed: slide.hasZoomOutAnimation && !this.state.isVisibleContent,
        });

        return (
          <TransitionGroup>
            <CSSTransition
              key={this.state.currentSlide}
              classNames="SliderWidget__content_animated"
              timeout={ANIMATION_TIMEOUT}
            >
              <div className="SliderWidget__content">
                <button
                  className={`SliderWidget__content__pause opacity ${this.state.isPause && 'active'}`}
                  onClick={() => this.pause(this.state.currentSlide)}
                  data-pause={intl.get('activity_page.pause')}
                  data-play={intl.get('activity_page.play')}
                >
                  <i className="SliderWidget__content__pauseicon" />
                </button>
                <img className={imageClasses} src={slide.imageURL} alt={slide.title} title={slide.title} />
                <div className="SliderWidget__infoWrapper_inside">
                  {this.renderInfo()}
                </div>
              </div>
            </CSSTransition>
          </TransitionGroup>
        );
      }
      return (
        <div className="SliderWidget__content">
          {intl.get('assignment list.Nothing')}
        </div>
      );
    }
  }

  private renderInfo(isMobile: boolean = false) {
    const { isVisibleContent } = this.state;

    if (this.props.widget) {
      const slide = this.props.widget.slides[this.state.currentSlide];

      if (slide) {

        const descriptionClasses = classNames('SliderWidget__description', {
          SliderWidget__description_oneLine: true // !isVisibleContent && !isMobile,
        });

        const titleClasses = classNames('SliderWidget__title', {
          SliderWidget__title_oneLine: !isVisibleContent && !isMobile,
        });

        const button = (
          <button className="SliderWidget__button" onClick={this.openSlide.bind(this, slide.buttonURL, slide.buttonBehavior)}>
            {slide.buttonText}
          </button>
        );

        const description = <div className={descriptionClasses} dangerouslySetInnerHTML={{ __html: slide.description }} />;

        return (
          <div className="SliderWidget__info">
            <div className={titleClasses}>
              {slide.title}
            </div>
            {slide.description && !isMobile && description}
            {slide.buttonText && (isVisibleContent || isMobile) && button}
          </div>
        );
      }
    }
  }

  private renderSlideSwitcher() {
    if (this.props.widget) {
      const buttons = this.props.widget!.slides.map((slide, idx) => {
        const classes = classNames('SliderWidget__switchButton', {
          SliderWidget__switchButton_active: idx === this.state.currentSlide,
        });

        return (<button key={idx} role="button" className={classes} onClick={this.selectSlide.bind(this, idx)}/>);
      });

      return (
        <div className="SliderWidget__slideSwitcher">
          {buttons}
          <div
            className={`SliderWidget__content__pause ${this.state.isPause && 'active'}`}
            data-pause={intl.get('activity_page.pause')}
            data-play={intl.get('activity_page.play')}
          >
            <i className="SliderWidget__content__pauseicon" />
          </div>
        </div>
      );
    }
  }

  private selectSlide(id: number) {
    this.start(id);
  }

  private onCollapseWidget = () => {
    this.setState({ isVisibleContent: !this.state.isVisibleContent });
  }

  public componentDidMount() {
    const hasSomeSlides = this.props.widget && this.props.widget.slides.length > 1;
    const { state } = this.props;

    if (hasSomeSlides && !state) {
      const currentSlide = 0;

      this.start(currentSlide);
    }
  }

  public componentDidUpdate(prevProps: Readonly<SliderWidgetProps>, prevState: Readonly<SliderWidgetState>) {
    const hasSomeSlides = this.props.widget && this.props.widget.slides.length > 1;
    const { state } = this.props;
    const { isRunning } = this.state;

    if (hasSomeSlides && state !== StoreState.LOADING && !isRunning) {
      const currentSlide = 0;

      this.start(currentSlide);
    }

    if (prevProps.state === StoreState.PENDING && (this.props.state === StoreState.LOADING || this.props.state === StoreState.ERROR)) {
      this.stop();
    }

    if (prevProps.widget && this.props.widget && !isEqual(prevProps.widget.slides, this.props.widget.slides)) {
      this.setState({
        isUpdated: true,
      });
    }
  }

  public componentWillUnmount() {
    this.stop();
  }

  public render() {
    const { isVisibleContent } = this.state;

    return (
      <div className={`SliderWidget ${!isVisibleContent && 'SliderWidget_collapsed'}`}>
        <div className="SliderWidget__titleWrapper">
          <WidgetHeader title="" onCollapseWidget={this.onCollapseWidget} isVisibleContent={this.state.isVisibleContent}/>
        </div>
        <div className="SliderWidget__contentWrapper">
          <ContentWrapper state={this.props.state} className="SliderWidget__content">
            <>
              {this.renderContent()}
              {this.renderSlideSwitcher()}
            </>
          </ContentWrapper>
        </div>
        <div className="SliderWidget__infoWrapper_outside">
          {this.renderInfo(true)}
        </div>
      </div>
    );
  }
}
