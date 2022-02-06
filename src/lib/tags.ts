import slugify from "slugify";

export const getTagSlug = (tag: string): string => {
  return slugify(tag, { lower: true });
};

export const getTagUrl = (tag: string): string => {
  return `/categories/${getTagSlug(tag)}`;
};
