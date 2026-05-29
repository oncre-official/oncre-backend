import { IBaseType } from '@on/utils/types';

export interface IRole extends IBaseType {
  name: string;
  description?: string;
}

export interface IRolePermission extends IBaseType {
  role_id: string;
  permission_id: string;
}
