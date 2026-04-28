import { Trophy } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useOptimize } from '../../hooks/useOptimize';
import { OUTLET_TYPES, OUTLET_LOCATION_TYPES } from '../../constants/options';
import { validationRules } from '../../utils/validators';
import ProductBarChart from '../charts/ProductBarChart';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import SliderField from '../ui/SliderField';
import EmptyState from '../ui/EmptyState';
import ErrorCard from '../ui/ErrorCard';
import Tilt from 'react-parallax-tilt';

/** @param {{}} props */
export const BestProductPanel = () => {
  const { data, loading, error, getBestProduct } = useOptimize();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({ defaultValues: { Item_MRP: 200, Outlet_Type: 0, Outlet_Age: 10, Outlet_Location_Type: 1 } });

  const onSubmit = (formData) => {
    const payload = {
      Item_MRP: Number(formData.Item_MRP),
      Outlet_Type: Number(formData.Outlet_Type) || 0,
      Outlet_Age: Number(formData.Outlet_Age),
      Outlet_Location_Type: Number(formData.Outlet_Location_Type) || 1
    };
    console.log('BestProduct payload:', payload);
    getBestProduct(payload);
  };

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <div className='glass space-y-4 rounded-2xl p-4 sm:p-5'>
        <InputField label='Item MRP' type='number' step='0.01' placeholder='Enter product price' {...register('Item_MRP', validationRules.Item_MRP)} error={errors.Item_MRP?.message} />
        <SelectField label='Outlet Type' options={OUTLET_TYPES} {...register('Outlet_Type', validationRules.Outlet_Type)} error={errors.Outlet_Type?.message} />
        <SliderField label='Outlet Age' value={watch('Outlet_Age')} onChange={(e) => setValue('Outlet_Age', Number(e.target.value))} />
        <SelectField label='Outlet Location Type' options={OUTLET_LOCATION_TYPES} {...register('Outlet_Location_Type', validationRules.Outlet_Location_Type)} error={errors.Outlet_Location_Type?.message} />
        <Button type='button' loading={loading} className='h-12 w-full text-base' onClick={handleSubmit(onSubmit)}>
          Find Best Product
        </Button>
      </div>
      <div>
        {error && <ErrorCard message={error} />}
        {!data && <EmptyState message='Run optimization first' />}
        {data && (
          <>
            <Tilt
              tiltEnable={typeof window !== 'undefined' && window.innerWidth >= 768}
              glareEnable={true}
              glareMaxOpacity={0.15}
              glareColor="#22d3ee"
              glarePosition="all"
              className="mb-4 rounded-xl gradient-border-card"
            >
              <div className='flex flex-col gap-2 rounded-xl bg-secondary/20 p-4 text-secondary glow-secondary h-full'>
                <Trophy className='h-5 w-5' />
                <p className='text-sm'>Winner Product</p>
                <p className='font-mono text-xl'>{data.best_product}</p>
                <p className='text-sm'>{Number(data.predicted_sales || 0).toFixed(2)}</p>
              </div>
            </Tilt>
            <ProductBarChart data={(data.all_results || []).map((r) => ({ product: r.product, sales: r.predicted_sales ?? r.sales }))} />
          </>
        )}
      </div>
    </div>
  );
};

export default BestProductPanel;