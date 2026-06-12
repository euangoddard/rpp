export const buildPermalink = (path: string): string => {
  return new URL(path, import.meta.env.SITE).toString();
};
