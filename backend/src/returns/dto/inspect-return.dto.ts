import { IsBoolean } from 'class-validator';

export class InspectReturnDto {
  @IsBoolean()
  resaleFit: boolean;
}
