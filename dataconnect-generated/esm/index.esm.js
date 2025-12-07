import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'hirefy',
  location: 'us-central1'
};

export const createSkillRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSkill', inputVars);
}
createSkillRef.operationName = 'CreateSkill';

export function createSkill(dcOrVars, vars) {
  return executeMutation(createSkillRef(dcOrVars, vars));
}

export const listProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListProjects');
}
listProjectsRef.operationName = 'ListProjects';

export function listProjects(dc) {
  return executeQuery(listProjectsRef(dc));
}

export const applyToProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ApplyToProject', inputVars);
}
applyToProjectRef.operationName = 'ApplyToProject';

export function applyToProject(dcOrVars, vars) {
  return executeMutation(applyToProjectRef(dcOrVars, vars));
}

export const getDeveloperProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDeveloperProfile');
}
getDeveloperProfileRef.operationName = 'GetDeveloperProfile';

export function getDeveloperProfile(dc) {
  return executeQuery(getDeveloperProfileRef(dc));
}

