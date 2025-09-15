export function copyText(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(() => resolve())
      .catch((err) => reject(new Error('Failed to copy text: ' + err)));
  });
}
