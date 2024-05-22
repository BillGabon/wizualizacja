import * as XLSX from 'xlsx';

interface dataInterface {
  name: string;
  value: number;
}

const handleData = async (file: File): Promise<dataInterface[]> => {
  return new Promise((resolve, reject) => {
    const maxSize = 5 * 1024 * 1024; //5GB

    if (file.size > maxSize) {
      return reject(new Error());
    }

    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(firstSheet);

        const formattedData: dataInterface[] = jsonData.map((item: any) => ({
          name: item.name,
          value: item.value,
        }));

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsArrayBuffer(file);
  });
};

export default handleData;
