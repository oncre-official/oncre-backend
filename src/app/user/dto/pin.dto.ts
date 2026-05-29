import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangePinDto {
  @ApiProperty({ description: 'User Old Pin' })
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  @IsNotEmpty()
  oldPin: string;

  @ApiProperty({ description: 'User New Pin' })
  @Length(4, 4)
  @Matches(/^\d{4}$/)
  @IsNotEmpty()
  newPin: string;
}
