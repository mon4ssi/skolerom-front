import React, { ChangeEvent, Component } from 'react';
import { observer } from 'mobx-react';
import intl from 'react-intl-universal';
import searchIcon from 'assets/images/search.svg';
import { ARTICLE_SERVICE_KEY, Attachment, CustomImgAttachment, Grade, Subject } from 'assignment/Assignment';
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
import { Pagination } from 'components/common/Pagination/Pagination';
import { MoreOptionsCustomImage } from './MoreOptionsCustomImage/MoreOptionsCustomImage';
import { CustomImageForm } from 'assignment/view/NewAssignment/AttachmentsList/CustomImageForm/CustomImageForm';
import { Notification, NotificationTypes } from 'components/common/Notification/Notification';
import { AttachmentContentType } from 'assignment/view/NewAssignment/AttachmentContentTypeContext';
import { lettersNoEn } from 'utils/lettersNoEn';
import { CustomImageFormSimple } from 'assignment/view/NewAssignment/AttachmentsList/CustomImageFormSimple/CustomImageFormSimple';

const const1 = 1;
const const2 = 2;
const const3 = 3;

interface Props {
  currentEntity?: DraftAssignment | DraftTeachingPath;
  localeKey: string;
}

interface SelectCoverImageState {
  query: string;
  articlesIds: Array<number>;
  mediaWP: Array<any>;
  mediaCustomImgs: Array<any>;
  imagenDefault: string;
  selectedTabId: number;
  currentPage: number;
  totalNumberOfPages: number;
  currentAttachmentId: number;
  currentAttachment: Attachment | null;
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
      currentAttachmentId: 0,
      currentAttachment: null,
      query: '',
    };
  }

  public renderTabById = (media: Array<Attachment>, selectedTabId: number) => {
    switch (selectedTabId) {
      case const1:
        return this.state.mediaWP!.length! === 0 ? this.addMedia() : this.renderMediaWP(media);
      case const2:
        return this.renderMediaCustom(media);
      case const3:
        return this.state.currentAttachmentId === 0 ? this.renderUploadForm() : this.renderEditForm();
      default:
        break;
    }
  }

  public addMedia = () => (
    <div style={{ width: '100%', height: '100%', textAlign: 'center' }}>

      <div style={{ margin: '40px', paddingLeft: '20%', paddingRight: '20%' }}>
        <div>
          <img className="buttonImgAddMedia" src={img} alt={'def'} title={'def'} />
        </div>
        <div>
          {intl.get('new assignment.images_options.no_images')}
        </div>

      </div>
      <button className="CreateButton" onClick={this.manageTabContentTabUpload}>{intl.get('new assignment.images_options.upload_image')}</button>
    </div>
  )

  public renderMediaWP = (mediaWP: Array<Attachment>) => (
    mediaWP.filter(
      media => this.filterWPImages(media)
    ).map(img =>
    (
      <button key={img.path} onClick={() => this.changeFeaturedImage(img.path, img.url_large!)} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton'}>
        <img className="imageForCover" key={img.path} src={img.path} />
        <img className="icon" src={greenCheck} />
      </button>
    )))

  public editItem = async (attachmentid?: number, attachment?: Attachment) => {
    this.setState({ selectedTabId: const3, currentAttachmentId: attachmentid!, currentAttachment: attachment! });
  }

  public onRenderThirdTab = (id: number) => {
    // console.log
  }

  public removeItem = async (attachmentid?: number) => {
    const deleteConfirmation = await this.confirmDeleteListItem();
    if (true!) {
      /* this.toggleAttachment(); */
    }
    if (deleteConfirmation!) {
      await this.articleService.deleteCustomImage(attachmentid!);
      Notification.create({
        type: NotificationTypes.SUCCESS,
        title: intl.get('new assignment.notification.success_removing_image'),
      });
      this.setState({ selectedTabId: 2 });
      const mediaImgsCustom = (await this.articleService.fetchCustomImages('', this.state.currentPage!, '')).myCustomImages;
      this.setState({ mediaCustomImgs: mediaImgsCustom! });
    }
  }

  public confirmDeleteListItem = async () => {
    /* this.closeActionMenu(); */

    const isDeletionApproved = await Notification.create({
      type: NotificationTypes.CONFIRM,
      title: intl.get('assignment list.Are you sure'),
      submitButtonTitle: intl.get('notifications.delete')
    });

    if (isDeletionApproved) {
      return true;
    }
  }

  public handleClick = async (attachmentid?: number) => {
    this.setState({ currentAttachmentId: attachmentid! });
  }

  public onResetId = async (attachmentid?: number) => {
    this.setState({ currentAttachmentId: attachmentid! });
  }

  public renderMediaCustom = (mediaCustom: Array<Attachment>) => (
    mediaCustom.map(img =>
    (
      <button key={img.path} className={(img.path === this.state.imagenDefault) ? 'active selectedButton' : 'selectedButton fixed'}>
        {<MoreOptionsCustomImage attachment={img} attachmentId={img.id} onEdit={this.editItem} onRemove={this.removeItem} onClick={this.handleClick} onResetId={this.onResetId} />}
        <img onClick={() => this.state.currentAttachmentId! === 0 && this.changeFeaturedImage(img.path, img.path!)} className="imageForCoverCustom" key={img.path} src={img.path} />
        <div onClick={() => this.state.currentAttachmentId! === 0 && this.changeFeaturedImage(img.path, img.path!)} className="imageInfo">
          <div className="rowImageInfo">{`${intl.get('new assignment.updateCustomImagesForm.title')}: ${img.title}`}</div>
          <div className="rowImageInfo">{`${intl.get('new assignment.updateCustomImagesForm.source')}: ${img.source === null ? img.src : img.source}`}</div>
        </div>
        <img className="icon" src={greenCheck} />

      </button>
    )))

  public updateMediaCustom = async (page?: number) => {
    this.setState({ query: '' });
    const mediaCustomUpdated = (await this.articleService.fetchCustomImages('', page ? page : 1, this.state.query ? this.state.query : ''));
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

  public renderEditForm = () => (
    <div style={{ width: '100%' }}>
      <CustomImageForm attachment={this.state.currentAttachment!} onRedirectToList={this.goToCustomImgAttachmentList} />
    </div>
  )

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
    const mediaImgsCustom = (await this.articleService.fetchCustomImages('', 1, this.state.query));
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
            this.changeFeaturedImage(this.state.mediaWP[0].path, this.state.mediaWP[0].url_large);
          } else {
            this.setState({ imagenDefault: currentEntity!.featuredImage });
          }
        } else {
          if (currentEntity!.featuredImage === undefined || currentEntity!.featuredImage === null) {
            this.changeFeaturedImage(this.state.mediaWP[0].path, this.state.mediaWP[0].url_large);
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

  public changeFeaturedImage = (path: string, url: string) => {
    const { currentEntity } = this.props;
    const { currentAttachmentId } = this.state;
    if (currentAttachmentId! === 0) {
      currentEntity!.setFeaturedImageFromCover(path);
      currentEntity!.setBackgroundImageHDResFromCover(url);
      this.setState({ imagenDefault: path });
    }
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
          <div onClick={this.manageTabContentTabWP} className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const1)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabWP}>
              {intl.get('new assignment.images_options.images_from_article')}
            </div>
          </div>
          <div onClick={this.manageTabContentTabCustom} className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const2)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabCustom}>
              {intl.get('new assignment.images_options.custom_images')}
            </div>
          </div>
          <div onClick={this.manageTabContentTabUpload} className={`coverImageButtonTab ${this.selectClassOption(selectedTabId, const3)}`}>
            <div className="buttonLabel" onClick={this.manageTabContentTabUpload}>
              {intl.get('new assignment.images_options.upload_image')}
            </div>
          </div>
        </div>
        <div className="contentWrapper">
          {selectedTabId !== const3 && this.renderSearchBar()}
          <div className="gapOptionsImages">
            {this.renderTabById(selectedTabId !== const3 ? selectedTabId === const1 ? mediaWP : mediaCustomImgs : [], selectedTabId)}

          </div>
          {selectedTabId === const2 && this.state.totalNumberOfPages > 0 && this.renderPagination()}
        </div>

      </div>
    );
  }

  public renderPlaceholder = () => {
    if (this.context.contentType === AttachmentContentType.image) {
      return intl.get('new assignment.search_for_images');
    }
    if (this.context.contentType === AttachmentContentType.customImage) {
      return intl.get('new assignment.search_for_images');
    }
    if (this.context.contentType === AttachmentContentType.video) {
      return intl.get('new assignment.search_for_videos');
    }
  }

  public handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
    if (lettersNoEn(e.target.value)) {
      this.setState({ query: e.target.value.toLowerCase() });
      const searchResults = this.state.mediaWP!.filter(
        media => this.filterWPImages(media)
      );
      /* console.log(searchResults); */
      /* this.setState() */
      // if (this.state.selectedTabId === const2) <- for not calling on the same time inside first and second tab
      if (true) {
        const newResults = await this.articleService.fetchCustomImages('', 1, e.target.value!.toLowerCase());
        const myCustomImagesSearch: Array<CustomImgAttachment> = newResults.myCustomImages;
        const numberOfPages: number = newResults.total_pages;
        this.setState({ currentPage: 1, mediaCustomImgs: myCustomImagesSearch, totalNumberOfPages: numberOfPages });
        /* const response = await newAssignmentStore!.fetchQuestionCustomImagesAttachments(String(this.state.listIdsSelected), AttachmentContentType.customImage, e.target.value!); */
        /* const myCustomImagesSearch: CustomImgAttachment[] = response.myCustomImages;
        const numberOfPages: number = response.total_pages; */
        /* this.setState({
          currentPage: 1,
        }); */
      }
    }
  }

  public filterWPImages = (attachment: Attachment): boolean => {
    const { query } = this.state;
    const buffer = [
      attachment.title || '',
      attachment.fileName || '',
      attachment.alt || '',
    ];

    return buffer.map(str => str.toLowerCase()).join('_').includes(query);
  }

  public renderSearchBar = () => {
    const { selectedTabId } = this.state;
    const { query } = this.state;
    if (selectedTabId !== const3) {
      return (
        <div className="search-field-block">
          <input
            className="search-input"
            type="text"
            name="query"
            placeholder={this.renderPlaceholder()}
            value={query}
            onChange={this.handleSearch}
            aria-required="true"
            aria-invalid="false"
          />
          <img src={searchIcon} alt="search-icon" />
        </div>
      );
    }
  }

  public renderPagination = () => {
    /* const {assignmentListStore, location} = this.props; */
    const { currentPage } = this.state;
    const pages = this.state.totalNumberOfPages;
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
    const pageChangedCustomImgs = (await this.articleService.fetchCustomImages('', selected + 1, this.state.query)).myCustomImages || [];
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
