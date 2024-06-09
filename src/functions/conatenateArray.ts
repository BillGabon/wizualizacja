
/**
 * returns the input array looped 5 times
 * @param arr array
 * @returns input array with itself appended to it 4 times
 */

function concatenateArray(arr: any[]): any[] {
    const concatenatedArray: any[] = arr;
    for (let i = 0; i < 5; i++) {
        concatenatedArray.push(...arr.slice(0, 5));
    }
    return concatenatedArray;
}

export default concatenateArray