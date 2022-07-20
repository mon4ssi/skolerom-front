import { AxiosResponse } from 'axios';
import intl from 'react-intl-universal';

import { API } from 'utils/api';
import { STATUS_FORBIDDEN, STATUS_NOT_FOUND } from 'utils/constants';

import { DistributionRepo, Distribution, School } from './Distribution';
import { buildDistribution, buildDistributionRequestDTO } from './factory';
import { LevelDTO } from 'student/api';

import { Notification, NotificationTypes } from 'components/common/Notification/Notification';

interface GrepDataDTO {
  displayName: string;
  code: string;
}

interface SchoolDTO {
  id: number;
  groupApiId : string;
  name: string;
  parent: string;
  address: string;
}

export interface DistributionStudentDTO {
  id: number;
  name: string;
  startDate: Date | null;
  endDate: Date | null;
  level: LevelDTO;
}

export interface DistributionGroupResponseDTO {
  id: number;
  groupName: string;
  school: SchoolDTO | null;
  grepData: GrepDataDTO | null;
  startDate: Date | null;
  endDate: Date | null;
  students: Array<DistributionStudentDTO>;
}

export interface DistributionResponseDTO {
  startDate: Date | null;
  endDate: Date | null;
  groups: Array<DistributionGroupResponseDTO>;
  referralLink: string;
  level: LevelDTO;
}

interface PaginationDTO {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: Object;
}
interface MetaDTO {
  pagination: PaginationDTO;
}

export interface DistributionStudentRequestDTO {
  studentId: number;
  startDate: string | null;
  endDate: string | null;
}

export interface DistributionGroupRequestDTO {
  groupId: number;
  startDate: string | null;
  endDate: string | null;
  assignedStudents: Array<DistributionStudentRequestDTO>;
}

export interface DistributionRequestDTO {
  assignedGroups: Array<DistributionGroupRequestDTO>;
}

export class DistributionApi implements DistributionRepo {

  public async getAssignmentDistributionData(id: number) {
    const groupsResponse: AxiosResponse<DistributionResponseDTO> = await API.get(`/api/teacher/assignments/${id}/distribute`);

    return buildDistribution(groupsResponse.data, id);
  }

  public async getTeachingPathDistributionData(id: number) {
    const groupsResponse: AxiosResponse<DistributionResponseDTO> = await API.get(`/api/teacher/teaching-paths/${id}/distribute`);
    return buildDistribution(groupsResponse.data, id);
  }

  public async saveAssignmentDistribution(distribution: Distribution) {
    try {
      await API.post(
        `api/teacher/assignments/${distribution.id}/distribute`,
        buildDistributionRequestDTO(distribution)
      );
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.message
      });
    }
  }

  public async saveTeachingPathDistribution(distribution: Distribution) {
    try {
      await API.post(
        `/api/teacher/teaching-paths/${distribution.id}/distribute`,
        buildDistributionRequestDTO(distribution)
      );
    } catch (error) {
      Notification.create({
        type: NotificationTypes.ERROR,
        title: error.message
      });
    }
  }

  public async assignStudentToAssignment(assignmentId: string, referralToken: string): Promise<string> {
    try {
      await API.post(
        `/api/student/assignments/${assignmentId}/assign`,
        { referral_token: referralToken }
      );

      return '';
    } catch (error) {
      switch (error.response.status) {
        case STATUS_FORBIDDEN:
          return intl.get('distribution_page.assignment_cannot_be_assigned');
        case STATUS_NOT_FOUND:
          return intl.get('distribution_page.assignment_is_already_assigned');
        default:
          return error.message;
      }
    }
  }

  public async assignStudentToTeachingPath(teachingPathId: string, referralToken: string): Promise<string> {
    try {
      await API.post(
        `/api/student/teaching-paths/${teachingPathId}/assign`,
        { referral_token: referralToken }
      );
      return '';
    } catch (error) {
      switch (error.response.status) {
        case STATUS_FORBIDDEN:
          return intl.get('distribution_page.teaching_path_cannot_be_assigned');
        case STATUS_NOT_FOUND:
          return intl.get('distribution_page.teaching_path_is_already_assigned');
        default:
          return error.message;
      }
    }
  }
}
