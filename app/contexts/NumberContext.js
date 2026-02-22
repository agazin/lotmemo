'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NumberContext = createContext();

export function NumberProvider({ children }) {
  const [numbers, setNumbers] = useState([]);
  const [latestResults, setLatestResults] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    // Load numbers from localStorage
    const storedNumbers = localStorage.getItem('numbers');
    if (storedNumbers) {
      try {
        setNumbers(JSON.parse(storedNumbers));
      } catch {
        setNumbers([]);
      }
    }

    // Load latest results from localStorage
    const storedResults = localStorage.getItem('latestResults');
    if (storedResults) {
      try {
        setLatestResults(JSON.parse(storedResults));
      } catch {
        setLatestResults(null);
      }
    }
  }, []);

  const persist = (data) => {
    setNumbers(data);
    localStorage.setItem('numbers', JSON.stringify(data));
  };

  const addNumber = (data) => {
    const newNumber = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...data,
      status: 'PENDING',  // PENDING | WIN | LOSE | REJECTED
      odds: null,          // filled at save time from settings
      recordedBy: user?.username,
      timestamp: new Date().toISOString(),
    };

    // Use functional setState to avoid stale closure when called
    // multiple times in a loop (e.g. รูดหน้า generates 10 bets)
    setNumbers(prev => {
      const updated = [...prev, newNumber];
      localStorage.setItem('numbers', JSON.stringify(updated));
      return updated;
    });
    return newNumber;
  };

  const deleteNumber = (id) => {
    setNumbers(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('numbers', JSON.stringify(updated));
      return updated;
    });
  };

  const getNumbersByUser = (userId) => {
    return numbers.filter(number =>
      number.customerId === userId ||
      (user?.role !== 'user' && number.recordedBy === userId)
    );
  };

  const getNumbersByCustomer = (customerId) => {
    if (user?.role === 'user' && user?.username !== customerId) {
      return [];
    }
    return numbers.filter(number => number.customerId === customerId);
  };

  /** Update status of matching transactions (for result processing) */
  const updateStatus = (filter, newStatus) => {
    setNumbers(prev => {
      const updated = prev.map(n => {
        if (filter(n)) {
          return { ...n, status: newStatus };
        }
        return n;
      });
      localStorage.setItem('numbers', JSON.stringify(updated));
      return updated;
    });
  };

  /** Apply full graded array back to state (for bulk recalculation) */
  const applyGrading = (gradedNumbers, resultsData) => {
    setNumbers(gradedNumbers);
    localStorage.setItem('numbers', JSON.stringify(gradedNumbers));

    setLatestResults(resultsData);
    localStorage.setItem('latestResults', JSON.stringify(resultsData));
  };

  /** Clear all records (new draw reset) */
  const clearAll = () => {
    persist([]);
    setLatestResults(null);
    localStorage.removeItem('latestResults');
  };

  /** Export all data as JSON */
  const exportData = () => {
    return JSON.stringify(numbers, null, 2);
  };

  /** Get aggregated totals per number+type */
  const getAggregatedTotals = () => {
    const totals = {};
    numbers.forEach(n => {
      const key = `${n.number}-${n.type}`;
      if (!totals[key]) {
        totals[key] = { number: n.number, type: n.type, total: 0, count: 0 };
      }
      totals[key].total += n.amount;
      totals[key].count += 1;
    });
    return Object.values(totals).sort((a, b) => b.total - a.total);
  };

  return (
    <NumberContext.Provider value={{
      numbers,
      addNumber,
      deleteNumber,
      getNumbersByUser,
      getNumbersByCustomer,
      updateStatus,
      applyGrading,
      clearAll,
      exportData,
      getAggregatedTotals,
      latestResults,
    }}>
      {children}
    </NumberContext.Provider>
  );
}

export function useNumbers() {
  return useContext(NumberContext);
}
