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
import { CustomImageFormSimple } from './CustomImageFormSimple/CustomImageFormSimple';
import { Pagination } from 'components/common/Pagination/Pagination';
import { MoreOptionsCustomImage } from './MoreOptionsCustomImage/MoreOptionsCustomImage';

const const1 = 1;
const const2 = 2;
const const3 = 3;

interface Props {
  currentEntity?: DraftAssignment | DraftTeachingPath;
  localeKey: string;
}

interface SelectCoverImageState {
  articlesIds: Array<number>;
  mediaWP: Array<any>;
  mediaCustomImgs: Array<any>;
  imagenDefault: string;
  selectedTabId: number;
  currentPage: number;
  totalNumberOfPages: number;
}

@observer
export class SelectCoverImage extends Component<Props, SelectCoverImageState> {
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  constructor(props: Props) {
    super(props);
    this.state = {
      articlesIds: [],
      mediaWP: [],
      mediaCustomImgs: [],
      imagenDefault: placeholderImg,
      selectedTabId: 1,
      currentPage: 1,
      totalNumberOfPages: 0,
    };
  }

  public renderTabById = (media: Array<Attachment>, selectedTabId: number) => {
    switch (selectedTabId) {
      case const1:
        return this.renderMediaWP(media);
      case const2:
        return this.renderMediaCustom(media);
      case const3:
        return this.renderUploadForm();
      default:
        break;
    }
  }

  public renderMediaWP = (mediaWP: Array<Attachment>) => (
    mediaWP.map(img =>
    (
      <button key={img.path} onClick={() => this.changeFeaturedImage(img.path)} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton'}>
        <img className="imageForCover" key={img.path} src={img.path} />
        <img className="icon" src={greenCheck} />
      </button>
    )))

  public editItem = async () => {
    this.setState({ selectedTabId: 3 });
  }

  public onRenderThirdTab = (id: number) => {
    // console.log
  }

  public removeItem = async () => {
    // console.log
  }

  public renderMediaCustom = (mediaCustom: Array<Attachment>) => (
    mediaCustom.map(img =>
    (
      <button key={img.path} onClick={() => this.changeFeaturedImage(img.path)} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton'}>
        {true && <MoreOptionsCustomImage attachmentId={img.id} onEdit={this.editItem} onRemove={this.removeItem} />}
        <img className="imageForCoverCustom" key={img.path} src={img.path} />
        <div className="imageInfo">
          <div className="rowImageInfo">Title:{img.title}</div>
          <div className="rowImageInfo">Source:{img.source ? img.source : ''}</div>
        </div>
        <img className="icon" src={greenCheck} />

      </button>
    )))

  public updateMediaCustom = async (page?: number) => {
    const mediaCustomUpdated = (await this.articleService.fetchCustomImages('', page ? page : 1));
    const data = mediaCustomUpdated.myCustomImages || [];
    const numberOfPages = mediaCustomUpdated.total_pages;
    this.setState({ mediaCustomImgs: data!, totalNumberOfPages: numberOfPages });
  }

  /* public renderMediaCustomFunction = (mediaCustom: Array<Attachment>) => {
    return (
      <div>
        {mediaCustom.map(img =>
        (
          <button key={img.path} onClick={() => this.changeFeaturedImage(img.path)} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton'}>
            <img className="imageForCover" key={img.path} src={img.path} />
            <img className="icon" src={greenCheck} />
          </button>
        ))}
      </div>
    )
  } */

  public goToCustomImgAttachmentList = async () => {
    this.setState({ selectedTabId: 2 });
    this.updateMediaCustom();
    /* this.renderAttachmentTab(); */
  }

  public renderUploadForm = () => {
    const { mediaCustomImgs } = this.state;
    /* console.log(this.renderMediaCustomFunction(mediaCustomImgs!)); */
    return (
      <div style={{ width: '100%' }}>
        <CustomImageFormSimple onRedirectToList={this.goToCustomImgAttachmentList} />
      </div>
    );
  }
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
    const mediaImgsWP: Array<Attachment> = await this.articleService.fetchCoverImages(articleIds) || [];
    const mediaImgsCustom = (await this.articleService.fetchCustomImages('', 1));
    const data: Array<Attachment> = mediaImgsCustom.myCustomImages || [];
    const numberOfPages = mediaImgsCustom.total_pages;
    this.setState({
      mediaWP: mediaImgsWP!,
      mediaCustomImgs: data!,
      totalNumberOfPages: numberOfPages!,
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
      if (this.state.mediaWP.length > 0) {
        // article image
        if (localeKey === EditEntityLocaleKeys.NEW_ASSIGNMENT) {
          if (currentEntity!.featuredImage === undefined || currentEntity!.featuredImage === null) {
            this.changeFeaturedImage(this.state.mediaWP[0].path);
          } else {
            this.setState({ imagenDefault: currentEntity!.featuredImage });
          }
        } else {
          if (currentEntity!.featuredImage === undefined || currentEntity!.featuredImage === null) {
            this.changeFeaturedImage(this.state.mediaWP[0].path);
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

  public manageTabContentTabWP = () => (
    this.setState({ selectedTabId: 1 })
  )

  public manageTabContentTabCustom = () => (
    this.setState({ selectedTabId: 2 })
  )

  public manageTabContentTabUpload = () => (
    this.setState({ selectedTabId: 3 })
  )

  public selectClassOption = (tabid: number, position: number) => {
    switch (tabid) {
      case 0:
        if (position === 1) {
          return 'active';
        }
        return '';
        break;
      case 1:
        if (position === 1) {
          return 'active';
        }
        return '';
        break;
      case const2:
        if (position === const2) {
          return 'active';
        }
        return '';
        break;
      case const3:
        if (position === const3) {
          return 'active';
        }
        return '';
        break;
      default:
        if (position === 1) {
          return 'active';
        }
        return '';
        break;
    }
  }

  public renderQuestions = () => {
    const { currentEntity } = this.props;

    const { mediaWP, mediaCustomImgs, selectedTabId } = this.state;
    if (mediaWP.length === 0 && mediaCustomImgs.length === 0) {
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
        <div className="buttonContent">
          <div className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const1)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabWP}>
              {'IMAGES FROM ARTICLES'}
            </div>
          </div>
          <div className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const2)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabCustom}>
              {'CUSTOM IMAGES'}
            </div>
          </div>
          <div className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const3)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabUpload}>
              {'UPLOAD IMAGES'}
            </div>
          </div>
        </div>
        <div>
          <div className="gapOptionsImages">
            {this.renderTabById(selectedTabId !== const3 ? selectedTabId === const1 ? mediaWP : mediaCustomImgs : [], selectedTabId)}

          </div>
          {selectedTabId === const2 && this.renderPagination()}
        </div>

      </div>
    );
  }

  public renderPagination = () => {
    /* const { assignmentListStore, location } = this.props; */
    const { currentPage } = this.state;
    const pages = 5;
    if (pages > 1) {
      return (
        <Pagination
          pageCount={this.state.totalNumberOfPages!}
          onChangePage={this.onChangePage}
          page={currentPage}
        />
      );
    }
  }

  public onChangePage = async ({ selected }: { selected: number }) => {
    /* const { newAssignmentStore } = this.props; */
    this.setState({ currentPage: selected + 1 });
    const pageChangedCustomImgs = (await this.articleService.fetchCustomImages('', selected + 1)).myCustomImages || [];
    this.setState({ mediaCustomImgs: pageChangedCustomImgs! });
    /* newAssignmentStore!.currentPage = selected + 1;
    newAssignmentStore!.fetchingCustomImageAttachments = true;
    newAssignmentStore!.fetchQuestionCustomImagesAttachments(String(this.state.listIdsSelected), AttachmentContentType.customImage); */
    /* this.render(); */
    /* newAssignmentStore!.fetchingCustomImageAttachments = false; */
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
