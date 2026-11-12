
import React, {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import { apiRequest } from '../services/api';

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('finai_currency') || 'INR';
  });

  const [rates, setRates] = useState({
    INR: 1
  });

  const [ratesLoaded, setRatesLoaded] = useState(false);

  useEffect(() => {
    localStorage.setItem('finai_currency', currency);
  }, [currency]);

  useEffect(() => {
    const fetchRates = async () => {
      if (!localStorage.getItem('access_token')) {
        return;
      }

      setRatesLoaded(false);

      try {
        const response = await apiRequest('/api/currency/rates');

        setRates(response.rates);
        setRatesLoaded(true);
      } catch (error) {
        console.error('Unable to fetch exchange rates:', error);
      }
    };

    // Fetch rates when the application starts
    fetchRates();

    // Fetch rates again after successful login
    window.addEventListener('finai-auth-changed', fetchRates);

    return () => {
      window.removeEventListener('finai-auth-changed', fetchRates);
    };
  }, []);
  
    const formatCurrency = (amount) => {
    const inrAmount = Number(amount || 0);
    const rate = rates[currency] || 1;

    const convertedAmount = inrAmount * rate;

    const locale = currency === 'INR' ? 'en-IN' : 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(convertedAmount);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        ratesLoaded
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
