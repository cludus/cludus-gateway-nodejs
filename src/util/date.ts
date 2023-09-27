export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = (date.getDate()).toString().padStart(2, '0');
  const hour = (date.getHours()).toString().padStart(2, '0');
  const minute = (date.getMinutes()).toString().padStart(2, '0');
  const seconds = (date.getSeconds()).toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${seconds}`;
};
