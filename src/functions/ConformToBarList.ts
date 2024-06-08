
/**
 * Transforms arrays for other Tremor charts to array for bar chart component
 * @param array array to transform
 * @param name key to become name
 * @param value key to become value
 * @returns array that is usable by bar chart component
 */


function conformToBarList(array: Array<{ [key: string]: any }>, name: string, value: string): Array<{ name: any, value: any }> {
    return array.map(obj => {
      return {
        name: obj[name],
        value: obj[value]
      };
    });
  }
  
  export default conformToBarList