import React from 'react';
import { render } from 'react-dom';
import { init } from '@sentry/react';

import { App } from './components/App/App';
import { injector } from './Injector';

import { AssignmentApi, WPApi } from 'assignment/api';
import {
  ASSIGNMENT_REPO,
  AssignmentRepo,
  ArticleRepo,
  ARTICLE_REPO_KEY,
  ARTICLE_SERVICE_KEY
} from 'assignment/Assignment';
import { AssignmentService, ASSIGNMENT_SERVICE, ArticleService } from 'assignment/service';
import { SEARCH_SERVICE, SearchService } from 'search/service';
import { SEARCH_REPO, SearchRepo } from 'search/Search';
import { DraftAssignmentRepo, DRAFT_ASSIGNMENT_REPO } from 'assignment/assignmentDraft/AssignmentDraft';
import { DraftAssignmentApi } from 'assignment/assignmentDraft/api';
import { DraftAssignmentService, DRAFT_ASSIGNMENT_SERVICE } from 'assignment/assignmentDraft/service';
import { QuestionaryRepo, QUESTIONARY_REPO } from 'assignment/questionary/Questionary';
import { QuestionaryApi } from 'assignment/questionary/api';
import { QuestionaryService, QUESTIONARY_SERVICE } from 'assignment/questionary/service';
import { UserRepo, USER_REPO } from 'user/User';
import { UserService, USER_SERVICE } from 'user/UserService';
import { UserApi } from 'user/api/UserApi';
import { STORAGE_INTERACTOR_KEY, StorageInteractor } from 'utils/storageInteractor';
import { DISTRIBUTION_REPO, DistributionRepo } from 'distribution/Distribution';
import { DistributionApi } from 'distribution/api';
import { DISTRIBUTION_SERVICE, DistributionService } from 'distribution/service';
import { DRAFT_TEACHING_PATH_REPO, DraftTeachingPathRepo } from 'teachingPath/teachingPathDraft/TeachingPathDraft';
import { DraftTeachingPathApi } from 'teachingPath/teachingPathDraft/api';
import { DRAFT_TEACHING_PATH_SERVICE, DraftTeachingPathService } from 'teachingPath/teachingPathDraft/service';
import { TEACHING_PATH_SERVICE, TeachingPathService } from './teachingPath/service';
import { TEACHING_PATH_REPO, TeachingPathRepo } from './teachingPath/TeachingPath';
import { TeachingPathApi } from './teachingPath/api';
import {
  ASSIGNMENT_EVALUATION_REPO,
  AssignmentEvaluationRepo,
  TEACHING_PATH_EVALUATION_REPO,
  TeachingPathEvaluationRepo,
} from './evaluation/Evaluation';
import {
  ASSIGNMENT_EVALUATION_SERVICE,
  AssignmentEvaluationService,
  TEACHING_PATH_EVALUATION_SERVICE,
  TeachingPathEvaluationService
} from './evaluation/service';
import { AssignmentEvaluationApi, TeachingPathEvaluationApi } from './evaluation/api';
import { StudentRepo, STUDENT_REPO, StudentApi } from 'student/api';
import { STUDENT_SERVICE, StudentService } from 'student/service';
import { ACTIVITY_REPO_KEY, ActivityRepo } from 'activity/Activity';
import { ActivityApi } from 'activity/api';
import { ActivityService, ACTIVITY_SERVICE_KEY } from 'activity/service';
import { SearchApi } from 'search/api';

injector.set<StorageInteractor>(STORAGE_INTERACTOR_KEY, new StorageInteractor());
injector.set<ArticleRepo>(ARTICLE_REPO_KEY, new WPApi());
injector.set<ArticleService>(ARTICLE_SERVICE_KEY, new ArticleService());

injector.set<AssignmentRepo>(ASSIGNMENT_REPO, new AssignmentApi());
injector.set<AssignmentService>(ASSIGNMENT_SERVICE, new AssignmentService());
injector.set<UserRepo>(USER_REPO, new UserApi());
injector.set<UserService>(USER_SERVICE, new UserService());

injector.set<DraftAssignmentRepo>(DRAFT_ASSIGNMENT_REPO, new DraftAssignmentApi());
injector.set<DraftAssignmentService>(DRAFT_ASSIGNMENT_SERVICE, new DraftAssignmentService());

injector.set<QuestionaryRepo>(QUESTIONARY_REPO, new QuestionaryApi());
injector.set<QuestionaryService>(QUESTIONARY_SERVICE, new QuestionaryService());

injector.set<DistributionRepo>(DISTRIBUTION_REPO, new DistributionApi());
injector.set<DistributionService>(DISTRIBUTION_SERVICE, new DistributionService());

injector.set<DraftTeachingPathRepo>(DRAFT_TEACHING_PATH_REPO, new DraftTeachingPathApi());
injector.set<DraftTeachingPathService>(DRAFT_TEACHING_PATH_SERVICE, new DraftTeachingPathService());

injector.set<TeachingPathRepo>(TEACHING_PATH_REPO, new TeachingPathApi());
injector.set<TeachingPathService>(TEACHING_PATH_SERVICE, new TeachingPathService());

injector.set<AssignmentEvaluationRepo>(ASSIGNMENT_EVALUATION_REPO, new AssignmentEvaluationApi());
injector.set<AssignmentEvaluationService>(ASSIGNMENT_EVALUATION_SERVICE, new AssignmentEvaluationService());

injector.set<TeachingPathEvaluationRepo>(TEACHING_PATH_EVALUATION_REPO, new TeachingPathEvaluationApi());
injector.set<TeachingPathEvaluationService>(TEACHING_PATH_EVALUATION_SERVICE, new TeachingPathEvaluationService());

injector.set<StudentRepo>(STUDENT_REPO, new StudentApi());
injector.set<StudentService>(STUDENT_SERVICE, new StudentService());

injector.set<ActivityRepo>(ACTIVITY_REPO_KEY, new ActivityApi());
injector.set<ActivityService>(ACTIVITY_SERVICE_KEY, new ActivityService());

injector.set<SearchRepo>(SEARCH_REPO, new SearchApi());
injector.set<SearchService>(SEARCH_SERVICE, new SearchService());

if (process.env.REACT_APP_SENTRY_DSN) {
  init({ dsn: process.env.REACT_APP_SENTRY_DSN });
}

render(<App />, document.getElementById('root'));
