import { ObjectId } from 'mongodb';

export interface ServiceResponse<T> {
  data: T;
  message: string;
}

export interface ResponseDTO {
  success: boolean;
  data: null | object;
  message: string;
}

export interface IBaseType {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
