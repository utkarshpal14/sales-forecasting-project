import { motion } from 'framer-motion';

const groups = {
  Base: ['Item_Weight', 'Item_Fat_Content', 'Item_Visibility', 'Outlet_Identifier', 'Outlet_Size', 'Outlet_Location_Type'],
  Interaction: ['MRP_Visibility', 'MRP_Weight', 'Outlet_Age_Type', 'Item_Type_Visibility'],
  Polynomial: ['MRP_Squared', 'Weight_Squared'],
  Ratio: ['MRP_per_Weight', 'Visibility_per_Age'],
  Advanced: ['MRP_Bins', 'Outlet_Performance_Score', 'Price_vs_Category_Avg'],
};

/** @param {{}} props */
export const FeatureBadges = () => (
  <motion.div
    variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
    initial='initial'
    animate='animate'
    className='glass mt-6 rounded-2xl p-4 sm:p-5'
  >
    {Object.entries(groups).map(([g, list]) => (
      <div key={g} className='mb-5'>
        <h4 className='mb-2 text-xs uppercase tracking-widest text-muted'>{g}</h4>
        <div className='flex flex-wrap gap-2'>
          {list.map((f) => (
            <motion.span
              variants={{ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 } }}
              key={f}
              className='rounded-full bg-primary/20 px-2.5 py-1 text-xs text-primary'
            >
              {f}
            </motion.span>
          ))}
        </div>
      </div>
    ))}
  </motion.div>
);

export default FeatureBadges;