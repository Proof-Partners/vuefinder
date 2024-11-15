// a function to update an element in an array if it exists, or add it if it doesn't
// TODO deprecate
export default function upsert<T extends { path: string }>(array: T[], element: T) {
  const i = array.findIndex((e) => e.path === element.path);
  if (i > -1) {
    array[i] = element;
  } else {
    array.push(element);
  }
}