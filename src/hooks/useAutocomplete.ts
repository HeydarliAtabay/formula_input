import { useQuery } from '@tanstack/react-query';

// This is a mock function that simulates fetching autocomplete suggestions
// In a real app, you would replace this with an actual API call
const fetchSuggestions = async (query: string): Promise<any[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  const variables = [
    { id: 'v1', type: 'variable', value: 'Base salary', display: 'Base salary' },
    { id: 'v2', type: 'variable', value: 'Option grant', display: 'Option grant' },
    { id: 'v3', type: 'variable', value: 'Vesting period', display: 'Vesting period (years)' },
    { id: 'v4', type: 'variable', value: 'Current valuation', display: 'Current valuation' },
    { id: 'v5', type: 'variable', value: 'Exit valuation', display: 'Exit valuation' },
    { id: 'v6', type: 'variable', value: 'Future dilution', display: 'Future dilution' },
    { id: 'v7', type: 'variable', value: 'Annual equity comp', display: 'Annual equity comp' },
  ];
  
  const functions = [
    { id: 'f1', type: 'function', value: 'SUM', display: 'SUM()' },
    { id: 'f2', type: 'function', value: 'AVERAGE', display: 'AVERAGE()' },
    { id: 'f3', type: 'function', value: 'MIN', display: 'MIN()' },
    { id: 'f4', type: 'function', value: 'MAX', display: 'MAX()' },
    { id: 'f5', type: 'function', value: 'COUNT', display: 'COUNT()' },
    { id: 'f6', type: 'function', value: 'FORECAST', display: 'FORECAST()' },
  ];
  
  const operators = [
    { id: 'o1', type: 'operator', value: '+', display: '+' },
    { id: 'o2', type: 'operator', value: '-', display: '-' },
    { id: 'o3', type: 'operator', value: '*', display: '*' },
    { id: 'o4', type: 'operator', value: '/', display: '/' },
    { id: 'o5', type: 'operator', value: '^', display: '^' },
    { id: 'o6', type: 'operator', value: '(', display: '(' },
    { id: 'o7', type: 'operator', value: ')', display: ')' },
  ];
  
  const allSuggestions = [...variables, ...functions, ...operators];
  
  if (!query) {
    return allSuggestions.slice(0, 10);
  }
  
  const lowerQuery = query.toLowerCase();
  return allSuggestions
    .filter(suggestion => 
      suggestion.display.toLowerCase().includes(lowerQuery) ||
      suggestion.value.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10);
};

export const useAutocomplete = (query: string) => {
  return useQuery({
    queryKey: ['autocomplete', query],
    queryFn: () => fetchSuggestions(query),
    staleTime: 60000, // 1 minute
    enabled: query.length > 0,
  });
}; 