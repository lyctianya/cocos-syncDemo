/**
 * 生成随机整数
 *
 * @export
 * @param {number} min
 * @param {number} max
 * @return {*}  {number}
 */
export function randomInt(min: number, max: number): number {
  return Math.floor((max - min + 1) * Math.random()) + min;
}

/**
 * 生成随机数
 *
 * @export
 * @param {number} [min=10]
 * @param {number} [max=100]
 * @param {number} [precision=0]
 * @return {*}  {number}
 */
export function random(min = 10, max = 100, precision = 0): number {
  return +(
    ((Math.random() * new Date().getTime()) % 1) * (max - min) +
    min
  ).toFixed(precision);
}

/**
 * 随机选取一个元素，原数组不变
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @return {*}  {T}
 */
export function pick<T = any>(
  arr: T[],
  exceptArr?: T[],
  getKey: (item: T) => any = (item) => item
): T {
  let useArr = arr;
  if (exceptArr) {
    useArr = difference(arr, exceptArr, getKey);
  }
  if (useArr.length === 0) {
    return null;
  }

  return useArr[randomInt(0, useArr.length - 1)];
}

/**
 * 随机选取一个元素，并从原数组中删除
 *
 * @export
 * @template T
 * @param {T[]} arr
 * @return {*}  {T}
 */

export function pickOut<T = any>(
  arr: T[],
  exceptArr?: T[],
  getKey: (item: T) => any = (item) => item
): T {
  const ret = pick(arr, exceptArr, getKey);
  if (ret === null) {
    return null;
  } else {
    const index = arr.indexOf(ret);
    return arr.splice(index, 1)[0];
  }
}

/**
 * 对原数组洗牌
 *
 * @export
 * @template T
 * @param {T[]} origin
 * @param {number} [count]
 */
export function shuffleArr<T = any>(origin: T[], count?: number) {
  if (!count) {
    count = origin.length / 2;
  }
  for (let i = 0; i < count; i++) {
    const a = randomInt(0, origin.length - 1);
    const b = randomInt(0, origin.length - 1);
    if (a != b) [origin[a], origin[b]] = [origin[b], origin[a]];
  }
}

/**
 * 返回洗牌后的新数组
 *
 * @export
 * @template T
 * @param {T[]} origin
 * @param {number} [count]
 * @return {*}  {T[]}
 */
export function shuffleNewArr<T = any>(origin: T[], count?: number): T[] {
  const indexArr = origin.map((v, k) => k);
  if (!count) {
    count = indexArr.length / 2;
  }
  for (let i = 0; i < count; i++) {
    const a = randomInt(0, indexArr.length - 1);
    const b = randomInt(0, indexArr.length - 1);
    if (a != b) [indexArr[a], indexArr[b]] = [indexArr[b], indexArr[a]];
  }
  return indexArr.map((v) => origin[v]);
}

/**
 * 交集
 *
 * @export
 * @template T
 * @param {T[]} array1
 * @param {T[]} array2
 * @param {(item: T) => any} [getKey=(item) => item]
 * @return {*}  {T[]}
 */
export function intersection<T>(
  array1: T[],
  array2: T[],
  getKey: (item: T) => any = (item) => item
): T[] {
  const result: T[] = [];
  array1.forEach((item1) => {
    if (array2.findIndex((item2) => getKey(item1) === getKey(item2)) !== -1) {
      result.push(item1);
    }
  });
  return result;
}

/**
 * 合集
 *
 * @export
 * @template T
 * @param {T[]} array1
 * @param {T[]} array2
 * @param {(item: T) => any} [getKey=(item) => item]
 * @return {*}  {T[]}
 */
export function union<T>(
  array1: T[],
  array2: T[],
  getKey: (item: T) => any = (item) => item
): T[] {
  const result = [...array1];
  const resultKey = result.map((item) => getKey(item));
  array2.forEach((item2) => {
    const item2Key = getKey(item2);
    if (resultKey.every((resultItem) => resultItem !== item2Key)) {
      result.push(item2);
      resultKey.push(item2Key);
    }
  });
  return result;
}

/**
 * 在array1-array2 的元素
 * @param {T[]} array1
 * @param {T[]} array2
 * @param {(item: T) => any} getKey
 */
export function difference<T>(
  array1: T[],
  array2: T[],
  getKey: (item: T) => any = (item) => item
): T[] {
  const result: T[] = [];
  const array2Key = array2.map((item2) => getKey(item2));
  array1.forEach((item1) => {
    const item1Key = getKey(item1);
    if (array2Key.every((item2Key) => item2Key !== item1Key)) {
      result.push(item1);
    }
  });
  return result;
}

/**
 *
 * 去重
 * @export
 * @template T
 * @param {Array<T>} arr
 * @return {*}  {Array<T>}
 */
export function unique<T>(arr: Array<T>): Array<T> {
  return Array.from(new Set(arr));
}
