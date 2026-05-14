import { useState } from 'react';
import toast from 'react-hot-toast';
import { getBestProduct, getBestStore, getOptimalPrice } from '../api/endpoints';
import mockData from '../constants/mockData';

export const useOptimize = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = async (fn, params, fallback, msg) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(params);
      setData(res.data);
      toast.success(msg);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setData(fallback);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    setData,
    getBestProduct: (p) => run(getBestProduct, p, mockData.bestProductFallback, 'Best product ready'),
    getBestStore: (p) => run(getBestStore, p, mockData.bestStoreFallback, 'Best store ready'),
    getOptimalPrice: (p) => run(getOptimalPrice, p, { analysis: mockData.priceRevenue, optimal_price: 260, expected_revenue: 312000 }, 'Optimal price ready'),
  };
};

export default useOptimize;
