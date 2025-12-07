const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'hirefy',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

const createSkillRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateSkill', inputVars);
}
createSkillRef.operationName = 'CreateSkill';
exports.createSkillRef = createSkillRef;

exports.createSkill = function createSkill(dcOrVars, vars) {
  return executeMutation(createSkillRef(dcOrVars, vars));
};

const listProjectsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListProjects');
}
listProjectsRef.operationName = 'ListProjects';
exports.listProjectsRef = listProjectsRef;

exports.listProjects = function listProjects(dc) {
  return executeQuery(listProjectsRef(dc));
};

const applyToProjectRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'ApplyToProject', inputVars);
}
applyToProjectRef.operationName = 'ApplyToProject';
exports.applyToProjectRef = applyToProjectRef;

exports.applyToProject = function applyToProject(dcOrVars, vars) {
  return executeMutation(applyToProjectRef(dcOrVars, vars));
};

const getDeveloperProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDeveloperProfile');
}
getDeveloperProfileRef.operationName = 'GetDeveloperProfile';
exports.getDeveloperProfileRef = getDeveloperProfileRef;

exports.getDeveloperProfile = function getDeveloperProfile(dc) {
  return executeQuery(getDeveloperProfileRef(dc));
};
