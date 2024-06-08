
/**
 * 
 * @param data JSON in format required for Tremor charts
 * @returns array of keys
 */

const extractKeys = (data: Record<string, any>[]): string[] => {
  if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object' || data[0] === null) {
    throw new Error('Invalid input: input must be a non-empty array of objects');
  }
  
  const keys = Object.keys(data[0]);
  return keys;
};

export default extractKeys;