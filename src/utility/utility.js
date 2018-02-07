export const getParams = query => {
  if (!query) {
    return {};
  }

  return (/^[?#]/.test(query) ? query.slice(1) : query)
    .split('&')
    .reduce((params, param) => {
      let [key, value] = param.split('=');
      params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
      return params;
    }, {});
}

/**
 * Replaces string spaces with underscore and lowercases it
 * 
 * @export
 * @param {any} string 
 * @returns 
 */
export function clean(string) {
  return string.replace(/ /g, "_").toLowerCase()
}

export function removeHashtag(string) {
  return string.replace('#', "").toLowerCase();
}