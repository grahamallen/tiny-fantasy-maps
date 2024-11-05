// Polyfill of https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set/symmetricDifference
// setA NAND setB
export function systemicDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set(
    [...setA].filter((entry) => !setB.has(entry)).concat([...setB].filter((entry) => !setA.has(entry)))
  )
}