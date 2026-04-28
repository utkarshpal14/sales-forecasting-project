import { useForm } from 'react-hook-form';
import { ITEM_TYPES, OUTLET_TYPES, OUTLET_LOCATION_TYPES } from '../../constants/options';
import { validationRules } from '../../utils/validators';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import SelectField from '../ui/SelectField';
import SliderField from '../ui/SliderField';

/** @param {{ onSubmit:(data:any)=>void, loading?:boolean }} props */
export const PredictForm = ({ onSubmit, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({ defaultValues: { Item_MRP: '', Item_Type: 0, Outlet_Type: 0, Outlet_Age: 10, Outlet_Location_Type: 1 } });

  return (
    <form
      onSubmit={handleSubmit((d) =>
        onSubmit({ 
          Item_MRP: Number(d.Item_MRP), 
          Item_Type: Number(d.Item_Type) || 0, 
          Outlet_Type: Number(d.Outlet_Type) || 0, 
          Outlet_Age: Number(d.Outlet_Age), 
          Outlet_Location_Type: Number(d.Outlet_Location_Type) || 1 
        })
      )}
      className='glass space-y-4 rounded-2xl p-4 sm:p-5'
    >
      <InputField label='Item MRP' type='number' step='0.01' placeholder='Enter product price' {...register('Item_MRP', validationRules.Item_MRP)} error={errors.Item_MRP?.message} />
      <SelectField label='Item Type' options={ITEM_TYPES} {...register('Item_Type', validationRules.Item_Type)} error={errors.Item_Type?.message} />
      <SelectField label='Outlet Type' options={OUTLET_TYPES} {...register('Outlet_Type', validationRules.Outlet_Type)} error={errors.Outlet_Type?.message} />
      <SliderField label='Outlet Age' value={watch('Outlet_Age')} onChange={(e) => setValue('Outlet_Age', Number(e.target.value))} />
      <SelectField label='Outlet Location Type' options={OUTLET_LOCATION_TYPES} {...register('Outlet_Location_Type', validationRules.Outlet_Location_Type)} error={errors.Outlet_Location_Type?.message} />
      <Button type='submit' loading={loading} className='h-12 w-full text-base'>
        Predict Sales
      </Button>
    </form>
  );
};

export default PredictForm;