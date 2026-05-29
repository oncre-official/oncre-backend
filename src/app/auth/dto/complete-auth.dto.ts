import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { ObjectId } from 'mongodb';

import { ICompleteRegistration } from '../types/auth.interface';

export class CompleteRegistrationDto implements ICompleteRegistration {
  @ApiProperty({ example: 'Blessing Enterprises', description: 'Registered business name' })
  @IsString()
  @IsNotEmpty()
  businessName: string;

  @ApiProperty({ example: 'Retail', description: 'Type of business' })
  @IsString()
  @IsNotEmpty()
  businessType: string;

  @ApiProperty({ example: '12 Allen Avenue, Ikeja', description: 'Business address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: '65f1c2e9f9d8c9a1b1234567', description: 'State ID (MongoDB ObjectId)' })
  @IsMongoId()
  @IsNotEmpty()
  stateId: ObjectId;

  @ApiProperty({ example: '65f1c312f9d8c9a1b7654321', description: 'Local Government Area ID (MongoDB ObjectId)' })
  @IsMongoId()
  @IsNotEmpty()
  lgaId: ObjectId;
}
