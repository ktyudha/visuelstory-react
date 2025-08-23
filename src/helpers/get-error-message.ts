import { isEmpty } from 'lodash';

export const getErrorMessage = (
  key: string,
  errorList?: { [key: string]: string[] }
) => {
  if (!isEmpty(errorList)) {
    return errorList[key] ? errorList[key][0] : '';
  }

  return '';
};
