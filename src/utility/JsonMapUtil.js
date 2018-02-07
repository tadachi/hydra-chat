export function mapToJson(map) {
  return JSON.stringify([...map]);
}

export function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

export function arrayToJson(array) {
  return JSON.stringify(array)
}

export function jsonToArray(jsonString) {
  return Array.from(JSON.parse(jsonString))
}