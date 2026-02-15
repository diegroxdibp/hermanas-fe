import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumValue',
  pure: true,
  standalone: true,
})
export class EnumValuePipe implements PipeTransform {
  transform(key: string, enumObject: any): string {
    if (!key || !enumObject) {
      return key;
    }
    return enumObject[key] || key;
  }
}
