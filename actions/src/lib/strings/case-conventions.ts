const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g;
export const isKebabCase = (s: string): boolean => {
  return !!s.match(kebabCase);
};
