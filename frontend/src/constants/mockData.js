import { ITEM_TYPES } from './options';

const productComparison = Array.from({ length: 16 }, (_, i) => ({
  product: i,
  product_name: ITEM_TYPES[i]?.label ?? `Type ${i}`,
  product_label: ITEM_TYPES[i]?.label ?? `Type ${i}`,
  sales: 700 + i * 95,
}));

const storeIds = ['OUT010', 'OUT013', 'OUT017', 'OUT018', 'OUT019', 'OUT027', 'OUT035', 'OUT045', 'OUT046', 'OUT049'];
const storeComparison = Array.from({ length: 10 }, (_, i) => ({
  store: i,
  store_name: storeIds[i],
  store_label: storeIds[i],
  sales: 900 + i * 120,
}));

export const mockData = {
  salesTrend: [
    { month: 'Jan', sales: 980 },
    { month: 'Feb', sales: 1080 },
    { month: 'Mar', sales: 1200 },
    { month: 'Apr', sales: 1350 },
    { month: 'May', sales: 1420 },
    { month: 'Jun', sales: 1520 },
    { month: 'Jul', sales: 1480 },
    { month: 'Aug', sales: 1610 },
    { month: 'Sep', sales: 1720 },
    { month: 'Oct', sales: 1810 },
    { month: 'Nov', sales: 1940 },
    { month: 'Dec', sales: 2100 },
  ],
  productComparison,
  storeComparison,
  priceRevenue: Array.from({ length: 46 }, (_, i) => {
    const price = 50 + i * 10;
    const revenue = 3000 - (price - 260) ** 2 / 45;
    return { price, revenue: Math.max(300, revenue) };
  }),
  modelInfo: {
    model_type: 'CatBoost',
    r2_score: 0.62,
    r2_log: 0.76,
    rmse: 994.64,
    records: 8523,
    feature_count: 21,
    features: [
      'Item_Weight',
      'Item_Fat_Content',
      'Item_Visibility',
      'Item_Type',
      'Item_MRP',
      'Outlet_Identifier',
      'Outlet_Size',
      'Outlet_Location_Type',
      'Outlet_Type',
      'Outlet_Age',
      'MRP_Visibility',
      'MRP_Weight',
      'Outlet_Age_Type',
      'Item_Type_Visibility',
      'MRP_Squared',
      'Weight_Squared',
      'MRP_per_Weight',
      'Visibility_per_Age',
      'MRP_Bins',
      'Outlet_Performance_Score',
      'Price_vs_Category_Avg',
    ],
    status: 'active',
  },
  singlePrediction: { predicted_sales: 1624.32, status: 'success' },
  insight: { predicted_sales: 1624.32, demand_level: 'High', recommendation: 'Stock more', status: 'success' },
  batch: { predictions: [1400, 1560, 1710], count: 3, status: 'success' },
  bestProductFallback: {
    best_product: 13,
    best_product_name: 'Snack Foods',
    predicted_sales: 1750,
    all_results: productComparison.map((r) => ({ ...r, predicted_sales: r.sales })),
    status: 'success',
  },
  bestStoreFallback: {
    best_store: 4,
    best_store_name: 'OUT019',
    predicted_sales: 1880,
    all_results: storeComparison.map((r) => ({ ...r, predicted_sales: r.sales })),
    status: 'success',
  },
};

export default mockData;
