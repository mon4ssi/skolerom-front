import moment from 'moment';

import { Distribution, DistributionGroup, DistributionStudent } from './Distribution';
import {
  DistributionResponseDTO,
  DistributionRequestDTO,
  DistributionGroupRequestDTO,
  DistributionStudentRequestDTO,
} from './api';

export const buildDistribution = (
  groupsDTO: DistributionResponseDTO,
  id: number
  ) => new Distribution({
    id,
    startDate: groupsDTO.startDate,
    endDate: groupsDTO.endDate,
    groups: groupsDTO.groups,
    referralLink: groupsDTO.referralLink
  });

const buildAssignedStudentsRequestDTO = (student: DistributionStudent): DistributionStudentRequestDTO => ({
  studentId: student.id,
  startDate: student.endDate && moment().format('YYYY-MM-DD'),
  endDate: student.endDate && moment(student.endDate).format('YYYY-MM-DD')
});

const buildAssignedGroupsRequestDTO = (
  group: DistributionGroup,
  defaultStartDate: string,
  defaultEndDate: string
  ): DistributionGroupRequestDTO => {
  const filteredStudents = group.assignedStudents.filter(student => student.isSelected);

  return ({
    groupId: group.id,
    startDate: group.endDate ? moment().format('YYYY-MM-DD') : defaultStartDate,
    endDate: group.endDate ? moment(group.endDate).format('YYYY-MM-DD') : defaultEndDate,
    assignedStudents: filteredStudents.map(buildAssignedStudentsRequestDTO)
  });
};

export const buildDistributionRequestDTO = (distribution: Distribution): DistributionRequestDTO => {
  const filteredGroups = distribution.groups.filter(group => group.isSelected);

  const defaultStartDate = moment(distribution.startDate).format('YYYY-MM-DD');
  const defaultEndDate = moment(distribution.endDate).format('YYYY-MM-DD');

  return ({
    assignedGroups: filteredGroups.map(group => buildAssignedGroupsRequestDTO(group, defaultStartDate, defaultEndDate)),
  });
};
