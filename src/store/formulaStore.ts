import { create } from 'zustand';
import { evaluate } from 'mathjs';
import { persist } from 'zustand/middleware';

export type FormulaTag = {
  id: string;
  type: 'variable' | 'function' | 'operator';
  value: string;
  display: string;
};

export type FormulaToken = {
  id: string;
  type: 'tag' | 'text';
  value: string;
  position: number;
};

export type SavedFormula = {
  id: string;
  name: string;
  tokens: FormulaToken[];
  result: string | null;
  timestamp: number;
};

export type LinkedModel = {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
  isActive: boolean;
};

export type VariableValue = {
  id: string;
  name: string;
  value: number;
  modelId: string;
  displayFormat?: 'currency' | 'percent' | 'number';
  description?: string;
};

interface FormulaState {
  tokens: FormulaToken[];
  cursorPosition: number;
  selectedTagId: string | null;
  suggestions: any[];
  result: string | null;
  savedFormulas: SavedFormula[];
  linkedModels: LinkedModel[];
  variableValues: VariableValue[];
  addToken: (token: Omit<FormulaToken, 'id' | 'position'>) => void;
  insertText: (text: string) => void;
  deleteToken: (id: string) => void;
  moveBackward: () => void;
  moveForward: () => void;
  deleteBackward: () => void;
  selectTag: (id: string | null) => void;
  setSuggestions: (suggestions: any[]) => void;
  setResult: (result: string | null) => void;
  evaluateFormula: () => void;
  replaceTokenAtPosition: (position: number, token: Omit<FormulaToken, 'id' | 'position'>) => void;
  clearTokens: () => void;
  saveFormula: (name: string) => void;
  deleteSavedFormula: (id: string) => void;
  loadSavedFormula: (id: string) => void;
  addLinkedModel: (model: Omit<LinkedModel, 'id' | 'isActive'>) => void;
  removeLinkedModel: (id: string) => void;
  setActiveLinkedModel: (id: string) => void;
  updateVariableValue: (id: string, value: number) => void;
}

// Default variable values for each model
const defaultVariableValues: VariableValue[] = [
  // Compensation Calculator variables
  {
    id: 'base-salary',
    name: 'Base salary',
    value: 175000,
    modelId: 'comp-calc',
    displayFormat: 'currency',
    description: 'Annual base salary before taxes'
  },
  {
    id: 'annual-equity',
    name: 'Annual equity comp',
    value: 62500,
    modelId: 'comp-calc',
    displayFormat: 'currency',
    description: 'Annual equity compensation value'
  },
  
  // Equity Analysis variables
  {
    id: 'option-grant',
    name: 'Option grant',
    value: 0.005,
    modelId: 'equity-analyzer',
    displayFormat: 'percent',
    description: 'Percentage of company ownership'
  },
  {
    id: 'current-valuation',
    name: 'Current valuation',
    value: 50000000,
    modelId: 'equity-analyzer',
    displayFormat: 'currency',
    description: 'Current company valuation'
  },
  {
    id: 'exit-valuation',
    name: 'Exit valuation',
    value: 1000000000,
    modelId: 'equity-analyzer',
    displayFormat: 'currency',
    description: 'Projected exit valuation'
  },
  {
    id: 'future-dilution',
    name: 'Future dilution',
    value: 0.3,
    modelId: 'equity-analyzer',
    displayFormat: 'percent',
    description: 'Expected future dilution'
  },
  
  // Performance Metrics variables
  {
    id: 'vesting-period',
    name: 'Vesting period',
    value: 4,
    modelId: 'performance-metrics',
    displayFormat: 'number',
    description: 'Number of years for full vesting'
  }
];

// Default linked models
const defaultLinkedModels: LinkedModel[] = [
  {
    id: 'comp-calc',
    name: 'Compensation Calculator',
    type: 'Financial',
    color: '#7c4dff',
    icon: 'calculate',
    isActive: true
  },
  {
    id: 'equity-analyzer',
    name: 'Equity Analysis',
    type: 'Analytics',
    color: '#2196f3',
    icon: 'bar_chart',
    isActive: false
  },
  {
    id: 'performance-metrics',
    name: 'Performance Metrics',
    type: 'Data',
    color: '#4caf50',
    icon: 'table_chart',
    isActive: false
  }
];

export const useFormulaStore = create<FormulaState>()(
  persist(
    (set, get) => ({
      tokens: [],
      cursorPosition: 0,
      selectedTagId: null,
      suggestions: [],
      result: null,
      savedFormulas: [],
      linkedModels: defaultLinkedModels,
      variableValues: defaultVariableValues,

      addToken: (token) => set((state) => {
        const newToken: FormulaToken = {
          ...token,
          id: crypto.randomUUID(),
          position: state.cursorPosition
        };
        
        const newTokens = [
          ...state.tokens.slice(0, state.cursorPosition),
          newToken,
          ...state.tokens.slice(state.cursorPosition)
        ];
        
        // Update positions of tokens after the insertion
        const updatedTokens = newTokens.map((t, index) => ({
          ...t,
          position: index
        }));
        
        return {
          tokens: updatedTokens,
          cursorPosition: state.cursorPosition + 1
        };
      }),

      insertText: (text) => set((state) => {
        if (text === '') return state;
        
        // Handle operators
        const operators = ['+', '-', '*', '/', '^', '(', ')'];
        if (operators.includes(text)) {
          const newToken: FormulaToken = {
            id: crypto.randomUUID(),
            type: 'text',
            value: text,
            position: state.cursorPosition
          };
          
          const newTokens = [
            ...state.tokens.slice(0, state.cursorPosition),
            newToken,
            ...state.tokens.slice(state.cursorPosition)
          ];
          
          // Update positions
          const updatedTokens = newTokens.map((t, index) => ({
            ...t,
            position: index
          }));
          
          return {
            tokens: updatedTokens,
            cursorPosition: state.cursorPosition + 1
          };
        }
        
        // Handle numbers and other text
        let newTokens = [...state.tokens];
        const currentTokenIndex = state.cursorPosition > 0 ? state.cursorPosition - 1 : 0;
        
        // If we're at the beginning of the input or after a tag, add a new text token
        if (state.cursorPosition === 0 || 
            (state.cursorPosition > 0 && state.tokens[state.cursorPosition - 1]?.type === 'tag')) {
          
          const newToken: FormulaToken = {
            id: crypto.randomUUID(),
            type: 'text',
            value: text,
            position: state.cursorPosition
          };
          
          newTokens = [
            ...state.tokens.slice(0, state.cursorPosition),
            newToken,
            ...state.tokens.slice(state.cursorPosition)
          ];
          
          // Update positions
          const updatedTokens = newTokens.map((t, index) => ({
            ...t,
            position: index
          }));
          
          return {
            tokens: updatedTokens,
            cursorPosition: state.cursorPosition + 1
          };
        } 
        
        // If we're at the end or the current token is a tag, add a new text token
        if (state.cursorPosition >= state.tokens.length) {
          const newToken: FormulaToken = {
            id: crypto.randomUUID(),
            type: 'text',
            value: text,
            position: state.cursorPosition
          };
          
          newTokens = [
            ...state.tokens.slice(0, state.cursorPosition),
            newToken,
            ...state.tokens.slice(state.cursorPosition)
          ];
          
          // Update positions
          const updatedTokens = newTokens.map((t, index) => ({
            ...t,
            position: index
          }));
          
          return {
            tokens: updatedTokens,
            cursorPosition: state.cursorPosition + 1
          };
        } 
        
        // Otherwise, append to the current text token
        const currentToken = state.tokens[state.cursorPosition - 1];
        if (currentToken && currentToken.type === 'text') {
          newTokens[state.cursorPosition - 1] = {
            ...currentToken,
            value: currentToken.value + text
          };
          
          return {
            tokens: newTokens,
            cursorPosition: state.cursorPosition
          };
        }
        
        // If we can't find a text token to append to, create a new one
        const newToken: FormulaToken = {
          id: crypto.randomUUID(),
          type: 'text',
          value: text,
          position: state.cursorPosition
        };
        
        newTokens = [
          ...state.tokens.slice(0, state.cursorPosition),
          newToken,
          ...state.tokens.slice(state.cursorPosition)
        ];
        
        // Update positions
        const updatedTokens = newTokens.map((t, index) => ({
          ...t,
          position: index
        }));
        
        return {
          tokens: updatedTokens,
          cursorPosition: state.cursorPosition + 1
        };
      }),

      deleteToken: (id) => set((state) => {
        const tokenIndex = state.tokens.findIndex(token => token.id === id);
        if (tokenIndex === -1) return state;
        
        const newTokens = [
          ...state.tokens.slice(0, tokenIndex),
          ...state.tokens.slice(tokenIndex + 1)
        ];
        
        // Update positions
        const updatedTokens = newTokens.map((t, index) => ({
          ...t,
          position: index
        }));
        
        return {
          tokens: updatedTokens,
          cursorPosition: Math.min(tokenIndex, updatedTokens.length),
          selectedTagId: null
        };
      }),

      moveBackward: () => set((state) => ({
        cursorPosition: Math.max(0, state.cursorPosition - 1),
        selectedTagId: null
      })),

      moveForward: () => set((state) => ({
        cursorPosition: Math.min(state.tokens.length, state.cursorPosition + 1),
        selectedTagId: null
      })),

      deleteBackward: () => set((state) => {
        if (state.cursorPosition === 0) return state;
        
        const tokenToDelete = state.tokens[state.cursorPosition - 1];
        if (!tokenToDelete) return state;
        
        // If it's a tag or a single character text, remove the entire token
        if (tokenToDelete.type === 'tag' || tokenToDelete.value.length <= 1) {
          const newTokens = [
            ...state.tokens.slice(0, state.cursorPosition - 1),
            ...state.tokens.slice(state.cursorPosition)
          ];
          
          // Update positions
          const updatedTokens = newTokens.map((t, index) => ({
            ...t,
            position: index
          }));
          
          return {
            tokens: updatedTokens,
            cursorPosition: state.cursorPosition - 1,
            selectedTagId: null
          };
        }
        
        // If it's text with multiple characters, remove the last character
        if (tokenToDelete.type === 'text' && tokenToDelete.value.length > 1) {
          const newValue = tokenToDelete.value.slice(0, -1);
          
          const newTokens = [...state.tokens];
          newTokens[state.cursorPosition - 1] = {
            ...tokenToDelete,
            value: newValue
          };
          
          return {
            tokens: newTokens,
            cursorPosition: state.cursorPosition,
            selectedTagId: null
          };
        }
        
        return state;
      }),

      selectTag: (id) => set({
        selectedTagId: id
      }),

      setSuggestions: (suggestions) => set({
        suggestions
      }),

      setResult: (result) => set({
        result
      }),

      evaluateFormula: () => set((state) => {
        try {
          // Convert tokens to a formula string
          let formula = '';
          
          // Filter out any whitespace-only tokens
          const validTokens = state.tokens.filter(token => 
            token.type === 'tag' || (token.type === 'text' && token.value.trim() !== '')
          );
          
          // Build the formula
          validTokens.forEach(token => {
            if (token.type === 'tag') {
              // For tags, use their numeric value from our variable values
              const variable = state.variableValues.find(v => v.name === token.value);
              if (variable) {
                formula += variable.value;
              } else {
                throw new Error(`Unknown variable: ${token.value}`);
              }
            } else {
              // For text tokens, use the value directly, but trim any spaces
              formula += token.value.trim();
            }
          });
          
          if (formula.trim() === '') {
            return { result: '0' };
          }
          
          // Evaluate the formula
          const result = evaluate(formula);
          // Format the result based on its type
          let formattedResult;
          if (typeof result === 'number') {
            // Format as currency if it's a large number
            if (result >= 1000) {
              formattedResult = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 2
              }).format(result);
            } else {
              formattedResult = result.toString();
            }
          } else {
            formattedResult = result.toString();
          }
          
          return { result: formattedResult };
        } catch (error) {
          console.error('Error evaluating formula:', error);
          return { result: 'Error' };
        }
      }),

      replaceTokenAtPosition: (position, token) => set((state) => {
        const newToken: FormulaToken = {
          ...token,
          id: crypto.randomUUID(),
          position
        };
        
        const newTokens = [...state.tokens];
        newTokens[position] = newToken;
        
        return {
          tokens: newTokens,
          cursorPosition: position + 1
        };
      }),

      clearTokens: () => set({
        tokens: [],
        cursorPosition: 0,
        selectedTagId: null,
        result: null
      }),
      
      saveFormula: (name) => set((state) => {
        // First evaluate to get the result
        let currentResult = state.result;
        if (!currentResult) {
          try {
            // This is a simplified version of the evaluate function
            // You may want to reuse the logic from evaluateFormula
            const { evaluateFormula } = get();
            evaluateFormula();
            currentResult = get().result;
          } catch (error) {
            currentResult = 'Error';
          }
        }
        
        const newFormula: SavedFormula = {
          id: crypto.randomUUID(),
          name,
          tokens: [...state.tokens],
          result: currentResult,
          timestamp: Date.now()
        };
        
        return {
          savedFormulas: [...state.savedFormulas, newFormula]
        };
      }),
      
      deleteSavedFormula: (id) => set((state) => ({
        savedFormulas: state.savedFormulas.filter(formula => formula.id !== id)
      })),
      
      loadSavedFormula: (id) => set((state) => {
        const formulaToLoad = state.savedFormulas.find(formula => formula.id === id);
        if (!formulaToLoad) return state;
        
        return {
          tokens: [...formulaToLoad.tokens],
          cursorPosition: formulaToLoad.tokens.length,
          result: formulaToLoad.result
        };
      }),

      addLinkedModel: (model) => set((state) => {
        const newModel: LinkedModel = {
          ...model,
          id: crypto.randomUUID(),
          isActive: false
        };
        
        return {
          linkedModels: [...state.linkedModels, newModel]
        };
      }),
      
      removeLinkedModel: (id) => set((state) => {
        // Don't allow removing the last model
        if (state.linkedModels.length <= 1) return state;
        
        // If removing the active model, set a new active model
        let newLinkedModels = state.linkedModels.filter(model => model.id !== id);
        
        if (state.linkedModels.find(model => model.id === id)?.isActive && newLinkedModels.length > 0) {
          newLinkedModels = newLinkedModels.map((model, index) => ({
            ...model,
            isActive: index === 0
          }));
        }
        
        return {
          linkedModels: newLinkedModels
        };
      }),
      
      setActiveLinkedModel: (id) => set((state) => ({
        linkedModels: state.linkedModels.map(model => ({
          ...model,
          isActive: model.id === id
        }))
      })),

      updateVariableValue: (id, value) => set((state) => {
        const newVariableValues = state.variableValues.map(variable => 
          variable.id === id ? { ...variable, value } : variable
        );
        
        return {
          variableValues: newVariableValues
        };
      })
    }),
    {
      name: 'formula-storage',
      partialize: (state) => ({ 
        savedFormulas: state.savedFormulas, 
        linkedModels: state.linkedModels,
        variableValues: state.variableValues 
      }),
    }
  )
); 