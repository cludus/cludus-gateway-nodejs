export const formatDate = (date: Date): string => {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = (date.getDate()).toString().padStart(2, '0');
  const hour = (date.getHours()).toString().padStart(2, '0');
  const minute = (date.getMinutes()).toString().padStart(2, '0');
  const seconds = (date.getSeconds()).toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${seconds}`;
};

export const dateInSecondsSinceEpochIsAfterToday = (seconds?: number): boolean => {
  if (seconds) {
    const date = new Date(seconds * 1000).getTime();
    const now = new Date().getTime();
    return date > now;
  }
  return false;
};
