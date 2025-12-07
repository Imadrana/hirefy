import { CreateSkillData, CreateSkillVariables, ListProjectsData, ApplyToProjectData, ApplyToProjectVariables, GetDeveloperProfileData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateSkill(options?: useDataConnectMutationOptions<CreateSkillData, FirebaseError, CreateSkillVariables>): UseDataConnectMutationResult<CreateSkillData, CreateSkillVariables>;
export function useCreateSkill(dc: DataConnect, options?: useDataConnectMutationOptions<CreateSkillData, FirebaseError, CreateSkillVariables>): UseDataConnectMutationResult<CreateSkillData, CreateSkillVariables>;

export function useListProjects(options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;
export function useListProjects(dc: DataConnect, options?: useDataConnectQueryOptions<ListProjectsData>): UseDataConnectQueryResult<ListProjectsData, undefined>;

export function useApplyToProject(options?: useDataConnectMutationOptions<ApplyToProjectData, FirebaseError, ApplyToProjectVariables>): UseDataConnectMutationResult<ApplyToProjectData, ApplyToProjectVariables>;
export function useApplyToProject(dc: DataConnect, options?: useDataConnectMutationOptions<ApplyToProjectData, FirebaseError, ApplyToProjectVariables>): UseDataConnectMutationResult<ApplyToProjectData, ApplyToProjectVariables>;

export function useGetDeveloperProfile(options?: useDataConnectQueryOptions<GetDeveloperProfileData>): UseDataConnectQueryResult<GetDeveloperProfileData, undefined>;
export function useGetDeveloperProfile(dc: DataConnect, options?: useDataConnectQueryOptions<GetDeveloperProfileData>): UseDataConnectQueryResult<GetDeveloperProfileData, undefined>;
