import { fetchJSON } from './BaseAPI';

// 协同
export async function getProjectPartner(projectId) {
  return fetchJSON('/api/roles/partner/get', {
    method: 'post',
    projectId,
  });
}

export async function addPartnersToProject(partnerIdList, projectId) {
  return fetchJSON('/api/roles/partner/add', {
    method: 'post',
    partnerIdList,
    projectId,
  });
}
export async function removePartnerInProject(partnerId, projectId) {
  return fetchJSON('/api/roles/partner/remove', {
    method: 'post',
    partnerId,
    projectId,
  });
}
