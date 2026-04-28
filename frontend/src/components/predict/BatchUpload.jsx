import { UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from '../ui/Button';

/** @param {{ onSubmit:(rows:any[])=>void, loading?:boolean }} props */
export const BatchUpload = ({ onSubmit, loading }) => {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const onDrop = (files) => {
    const f = files[0];
    if (!f) return;
    f.text().then((text) => {
      try {
        const data = JSON.parse(text);
        if (!Array.isArray(data)) throw new Error('JSON must be array');
        setRows(data);
        setErr('');
      } catch (e) {
        setErr(e.message);
      }
    });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ accept: { 'application/json': ['.json'] }, onDrop });

  return (
    <div className='glass rounded-2xl p-4 sm:p-5'>
      <div {...getRootProps()} className={`flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center ${isDragActive ? 'border-primary' : 'border-borderc'}`}>
        <input {...getInputProps()} />
        <UploadCloud className='mb-3 h-10 w-10 text-primary' />
        <p className='text-sm text-textc'>Drop JSON here</p>
        <p className='mt-1 text-xs text-muted'>or click to browse</p>
        <p className='mt-2 text-xs text-muted'>Expected format: [{"{"}Item_MRP": 150, "Item_Type": 2, "Outlet_Type": 1, "Outlet_Age": 10, "Outlet_Location_Type": 1{"}"}]</p>
      </div>
      {err && <p className='mt-2 text-sm text-danger'>{err}</p>}
      {rows.length > 0 && (
        <>
          <p className='mt-3 text-sm text-muted'>{rows.length} records loaded</p>
          <pre className='mt-2 max-h-40 overflow-auto rounded bg-surface p-3 text-xs'>{JSON.stringify(rows.slice(0, 3), null, 2)}</pre>
          <Button className='mt-3 h-11 w-full' loading={loading} onClick={() => onSubmit(rows)}>
            Run Batch Prediction
          </Button>
        </>
      )}
    </div>
  );
};

export default BatchUpload;