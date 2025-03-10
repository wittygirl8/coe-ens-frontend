export const generateRandomId = () => {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
};
