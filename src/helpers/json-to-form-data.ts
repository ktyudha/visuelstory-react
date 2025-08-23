export type JSONValue =
  | string
  | number
  | boolean
  | null
  | File
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Converts a JSON object to FormData
 * @param json - The JSON object to convert
 * @param formData - An existing FormData object (optional, for recursion)
 * @param parentKey - The parent key used for nested objects (optional, for recursion)
 * @returns FormData object
 */
export const jsonToFormData = (
  json: { [key: string]: JSONValue },
  formData: FormData = new FormData(),
  parentKey: string = ''
): FormData => {
  Object.keys(json).forEach((key) => {
    const value = json[key];
    const formKey = parentKey ? `${parentKey}[${key}]` : key;

    if (value && typeof value === 'object' && !(value instanceof File)) {
      // Recursively handle nested objects
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          const arrayKey = `${formKey}[${index}]`;
          if (typeof item === 'object') {
            jsonToFormData(
              item as { [key: string]: JSONValue },
              formData,
              arrayKey
            );
          } else if (item !== null && item !== undefined) {
            formData.append(arrayKey, item as string | Blob);
          }
        });
      } else {
        jsonToFormData(
          value as { [key: string]: JSONValue },
          formData,
          formKey
        );
      }
    } else if (value !== null && value !== undefined) {
      formData.append(formKey, value as string | Blob);
    }
  });

  return formData;
};
