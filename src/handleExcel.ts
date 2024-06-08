import * as XLSX from 'xlsx';
import extractKeys from './extractKeys';

interface DataInterface {
  [key: string]: string | number;
}

/**
 * 
 * @param file Excel file
 * @returns [formatted data, array of keys as strings]
 */

const handleExcel = async (file: File): Promise<[DataInterface[], string[]]> => {
  return new Promise((resolve, reject) => {
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      return reject(new Error('File is too large'));
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

        const formattedData: DataInterface[] = jsonData.map((item: any) => ({
          ...item,
        }));

        const keys = extractKeys(formattedData);
        console.log(keys)
        console.log(formattedData)
        resolve([formattedData, keys]);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsArrayBuffer(file);
  });
};

export default handleExcel;
