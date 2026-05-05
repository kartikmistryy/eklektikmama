// Slugify supports accented Latin characters by stripping combining marks.
// Range ̀-ͯ covers Combining Diacritical Marks.
export function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
