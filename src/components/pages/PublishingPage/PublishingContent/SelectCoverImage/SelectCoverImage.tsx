import React, { Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import { ARTICLE_SERVICE_KEY, Attachment, Grade, Subject } from 'assignment/Assignment';
import { DraftAssignment, DraftAssignmentRepo, DRAFT_ASSIGNMENT_REPO } from 'assignment/assignmentDraft/AssignmentDraft';
import { DraftTeachingPath } from 'teachingPath/teachingPathDraft/TeachingPathDraft';

import './SelectCoverImage.scss';
import { ArticleLevels, EditEntityLocaleKeys } from 'utils/enums';

import img from 'assets/images/icon-image.svg';
import { ArticleService } from 'assignment/service';
import { injector } from 'Injector';
import placeholderImg from 'assets/images/list-placeholder.svg';
import greenCheck from 'assets/images/green_check.svg';
import { buildArticle } from 'assignment/factory';
import { AttachmentComponent } from 'assignment/view/NewAssignment/AttachmentsList/Attachment';
import { id } from 'date-fns/locale';

interface Props {
  currentEntity?: DraftAssignment | DraftTeachingPath;
  localeKey: string;
}

interface SelectCoverImageState {
  articlesIds: Array<number>;
  media: Array<any>;
  imagenDefault: string;
}

@observer
export class SelectCoverImage extends Component<Props, SelectCoverImageState> {
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  constructor(props: Props) {
    super(props);
    this.state = {
      articlesIds: [],
      media: [],
      imagenDefault: placeholderImg
    };
  }

  public renderMedia = (media: Array<Attachment>) => (
    media.map(img =>
    (
      <button key={img.path} onClick={() => this.changeFeaturedImage(img.path)} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton'}>
        <img className="imageForCover" key={img.path} src={img.path} />
        <img className="icon" src={greenCheck}/>
      </button>
    )))

  public renderQuestion = (title: string, index: number) => (
    <div className="question flexBox alignCenter" key={`question-${index}`}>
      <div className="questionNumber flexBox alignCenter justifyCenter">{index + 1}</div>
      <p className={'fs15 fw300'}>{title}</p>
    </div>
  )

  public componentDidMount = async () => {
    const { currentEntity } = this.props;
    const articleIds: Array<number> = await currentEntity!.getAllSelectedArticlesIds();
    const onlyOneSelected: Array<number> = [];
    onlyOneSelected.push(articleIds[0]);
    const mediaImgs: Array<Attachment> = await this.articleService.fetchCoverImages(articleIds) || [];
    this.setState({
      media: mediaImgs!,
      articlesIds: articleIds
    });
    this.firstFeaturedImage(articleIds);
    if (document.getElementById('CoverImagesContent')) {
      document.getElementById('CoverImagesContent')!.addEventListener('scroll', this.handerScroll);
    }
  }

  public handerScroll = async () => {
    const isFull = this.state.articlesIds.length;
    const IDHtml = document.getElementById('CoverImagesContent')! as HTMLElement;
    /* if (IDHtml.scrollHeight - Math.abs(IDHtml.scrollTop) === IDHtml.clientHeight) { }*/
  }

  public firstFeaturedImage = (ids: Array<number>) => {
    const { localeKey, currentEntity } = this.props;
    if (ids.length > 0) {
      if (this.state.media.length > 0) {
        // article image
        if (localeKey === EditEntityLocaleKeys.NEW_ASSIGNMENT) {
          if (currentEntity!.featuredImage === undefined || currentEntity!.featuredImage === null) {
            this.changeFeaturedImage(this.state.media[0].path);
          } else {
            this.setState({ imagenDefault: currentEntity!.featuredImage });
          }
        } else {
          if (currentEntity!.featuredImage === undefined || currentEntity!.featuredImage === null) {
            this.changeFeaturedImage(this.state.media[0].path);
          } else {
            this.setState({ imagenDefault: currentEntity!.featuredImage });
          }
        }
      } else {
        this.setState({ imagenDefault: placeholderImg });
      }
    } else {
      this.setState({ imagenDefault: placeholderImg });
    }
  }

  public changeFeaturedImage = (path: string) => {
    const { currentEntity } = this.props;
    currentEntity!.setFeaturedImageFromCover(path);
    this.setState({ imagenDefault: path });
  }

  public renderQuestions = () => {
    const { currentEntity } = this.props;

    const { media } = this.state;
    if (media.length === 0) {
      return (
        <div className="CenterImagenes centerMsj">
          {/*<p>{intl.get('publishing_page.notimages')}</p>*/}
        </div>
      );
    }
    return (
      <div className="CenterImagenes">
        <div className="buttonContent">
          <div className="coverImageButton">
            <img className="buttonImg" src={img} alt={'def'} title={'def'} />
            <div className="buttonLabel">
              {intl.get('publishing_page.select button')}
            </div>
          </div>
        </div>
        <div className="gapOptionsImages">
          {this.renderMedia(media)}
        </div>
      </div>
    );
  }

  public render() {
    const { currentEntity, localeKey } = this.props;
    return (
      <div className="SelectCoverImage flexBox dirColumn">
        <div className="SelectCoverImage__header">
          <img src={this.state.imagenDefault} />
        </div>
        <div className="SelectCoverImage__body" id="CoverImagesContent">
          {this.renderQuestions()}
        </div>
      </div>
    );
  }
}
