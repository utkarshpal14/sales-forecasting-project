import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useOptimize } from '../../hooks/useOptimize';
import { ITEM_TYPES, OUTLET_LOCATION_TYPES } from '../../constants/options';
import { validationRules } from '../../utils/validators';
import StoreBarChart from '../charts/StoreBarChart';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import SliderField from '../ui/SliderField';
import EmptyState from '../ui/EmptyState';
import ErrorCard from '../ui/ErrorCard';
import Tilt from 'react-parallax-tilt';

/** @param {{}} props */
export const BestStorePanel = () => {
  const { data, loading, error, getBestStore } = useOptimize();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({ defaultValues: { Item_MRP: 200, Item_Type: 0, Outlet_Age: 10, Outlet_Location_Type: 1 } });

  const onSubmit = (formData) => {
    const payload = {
      Item_MRP: Number(formData.Item_MRP),
      Item_Type: Number(formData.Item_Type) || 0,
      Outlet_Age: Number(formData.Outlet_Age),
      Outlet_Location_Type: Number(formData.Outlet_Location_Type) || 1
    };
    console.log('BestStore payload:', payload);
    getBestStore(payload);
  };

  return (
    <div className='grid gap-4 lg:grid-cols-2'>
      <div className='glass space-y-4 rounded-2xl p-4 sm:p-5'>
        <InputField label='Item MRP' type='number' step='0.01' placeholder='Enter product price' {...register('Item_MRP', validationRules.Item_MRP)} error={errors.Item_MRP?.message} />
        <SelectField label='Item Type' options={ITEM_TYPES} {...register('Item_Type', validationRules.Item_Type)} error={errors.Item_Type?.message} />
        <SliderField label='Outlet Age' value={watch('Outlet_Age')} onChange={(e) => setValue('Outlet_Age', Number(e.target.value))} />
        <SelectField label='Outlet Location Type' options={OUTLET_LOCATION_TYPES} {...register('Outlet_Location_Type', validationRules.Outlet_Location_Type)} error={errors.Outlet_Location_Type?.message} />
        <Button type='button' loading={loading} className='h-12 w-full text-base' onClick={handleSubmit(onSubmit)}>
          Find Best Store
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
              glareColor="#6366f1"
              glarePosition="all"
              className="mb-4 rounded-xl gradient-border-card"
            >
              <div className='flex flex-col gap-2 rounded-xl bg-primary/20 p-4 text-primary glow-primary h-full'>
                <Star className='h-5 w-5' />
                <p className='text-sm'>Winner Store</p>
                <p className='font-mono text-xl'>{data.best_store}</p>
                <p className='text-sm'>{Number(data.predicted_sales || 0).toFixed(2)}</p>
              </div>
            </Tilt>
            <StoreBarChart data={(data.all_results || []).map((r) => ({ store: r.store, sales: r.predicted_sales ?? r.sales }))} />
          </>
        )}
      </div>
    </div>
  );
};

export default BestStorePanel;