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
import { buildArticle } from 'assignment/factory';
import { AttachmentComponent } from 'assignment/view/NewAssignment/AttachmentsList/Attachment';

interface Props {
  currentEntity?: DraftAssignment | DraftTeachingPath;
  localeKey: string;
}

interface SelectCoverImageState {
  media: Array<any>;
}

@observer
export class SelectCoverImage extends Component<Props, SelectCoverImageState> {
  private articleService: ArticleService = injector.get<ArticleService>(ARTICLE_SERVICE_KEY);

  constructor(props: Props) {
    super(props);
    this.state = {
      media: [],
    };
  }

  public renderMedia = (media: Array<Attachment>) => (
    media.map(img =>
    (
      <button key={img.path} onClick={() => this.changeFeaturedImage(img.path)}>
        <img className="imageForCover" key={img.path} src={img.path} />
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
    const mediaImgs: Array<Attachment> = await this.articleService.fetchImages(articleIds!);

    this.setState({ media: mediaImgs! });

  }

  public changeFeaturedImage = (path: string) => {
    const { currentEntity } = this.props;
    currentEntity!.setFeaturedImageFromCover(path);

  }

  public renderQuestions = () => {
    const { currentEntity } = this.props;

    const questionsTitles = [
      ...(currentEntity as DraftAssignment)!.questions.map(question => question.title),
      intl.get('publishing_page.review_and_submit')
    ];
    const { media } = this.state;
    return (
      <div className="">
        <div className="buttonContent">

          <button className="coverImageButton">
            <img className="buttonImg" src={img} alt={'def'} title={'def'} />
            <div className="buttonLabel">
              Select a cover image
            </div>
          </button>
        </div>

        <div className="gapOptionsImages">
          {this.renderMedia(media)}
        </div>
        <p className="title">
          {intl.get('publishing_page.questions_overview')}
        </p>

        <div className="questions">
          {questionsTitles.map(this.renderQuestion)}
        </div>
      </div>
    );
  }

  public renderGradeSubject = (item: Grade | Subject) => (
    <div
      className="gradeSubject flexBox justifyCenter alignCenter fw500"
      key={`${item.id}-${item.title}`}
    >
      {item.title}
    </div>
  )

  public render() {
    const { currentEntity, localeKey } = this.props;

    return (
      <div className="SelectCoverImage flexBox dirColumn">

        {localeKey === EditEntityLocaleKeys.NEW_ASSIGNMENT && this.renderQuestions()}

      </div>
    );
  }
}
