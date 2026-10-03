// Only published/interactive projects get a case page. Gallery placeholders do not.
export const caseSlugs = {
  hochetsa: "hochesa",
  rec: "rec",
  cache: "beautybomb-delivery",
  planer: "planer",
};

export const casePath = (id) => caseSlugs[id] ? `/work/${caseSlugs[id]}` : null;
export const caseIdFromPath = (path) => Object.keys(caseSlugs).find(
  (id) => casePath(id) === path.replace(/\/$/, ""),
);
export const isCasePath = (path) => path.startsWith("/work/");
export const isPlainNavigation = (event) => !event.defaultPrevented &&
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
