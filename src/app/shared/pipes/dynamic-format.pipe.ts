import { Pipe, PipeTransform } from '@angular/core';
import { Genders } from '../enums/genders.enum';
import { FormatType } from '../enums/format-type.enum';

@Pipe({
  name: 'dynamicFormat',
  standalone: true,
})
export class DynamicFormatPipe implements PipeTransform {
  transform(value: any, formatType: FormatType): string {
    if (!value) return '';

    switch (formatType) {
      case FormatType.DATE:
        return this.formatDate(value);
      case FormatType.GENDER:
        return this.formatGender(value);
      default:
        return value;
    }
  }

  private formatDate(value: string | Date): string {
    const date = new Date(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatGender(value: string): string {
    return Genders[value as keyof typeof Genders] || value;
  }
}
