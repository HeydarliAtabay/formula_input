import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    InputAdornment,
    Tooltip,
    IconButton,
    Card,
    CardContent,
    Divider
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useFormulaStore } from '../store/formulaStore';
import type { VariableValue } from '../store/formulaStore';

export const VariableEditor: React.FC = () => {
    const { variableValues, linkedModels, updateVariableValue } = useFormulaStore();
    const [editingValues, setEditingValues] = useState<Record<string, string>>({});

    const activeModel = linkedModels.find(model => model.isActive);

    if (!activeModel) return null;

    // Filter variables for the active model
    const modelVariables = variableValues.filter(v => v.modelId === activeModel.id);

    const handleInputChange = (variable: VariableValue, value: string) => {
        setEditingValues(prev => ({
            ...prev,
            [variable.id]: value
        }));
    };

    const handleInputBlur = (variable: VariableValue) => {
        const inputValue = editingValues[variable.id];
        if (inputValue === undefined) return;

        let numericValue: number;

        // Convert string to proper numeric value based on format
        if (variable.displayFormat === 'percent') {
            // Convert percentage (e.g., "5%") to decimal (0.05)
            numericValue = parseFloat(inputValue.replace('%', '')) / 100;
        } else {
            // Remove currency symbols and commas for numeric parsing
            numericValue = parseFloat(inputValue.replace(/[$,]/g, ''));
        }

        if (!isNaN(numericValue)) {
            updateVariableValue(variable.id, numericValue);
        }

        // Clear the editing state
        setEditingValues(prev => {
            const newState = { ...prev };
            delete newState[variable.id];
            return newState;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent, variable: VariableValue) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleInputBlur(variable);
        }
    };

    const formatVariableValue = (variable: VariableValue): string => {
        const { value, displayFormat } = variable;

        if (displayFormat === 'currency') {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                notation: value >= 1000000 ? 'compact' : 'standard',
                maximumFractionDigits: 2
            }).format(value);
        } else if (displayFormat === 'percent') {
            return new Intl.NumberFormat('en-US', {
                style: 'percent',
                minimumFractionDigits: value < 0.01 ? 3 : 0,
                maximumFractionDigits: value < 0.01 ? 3 : 2
            }).format(value);
        } else {
            return value.toString();
        }
    };

    const getInputProps = (variable: VariableValue) => {
        if (variable.displayFormat === 'currency') {
            return {
                startAdornment: <InputAdornment position="start">$</InputAdornment>
            };
        } else if (variable.displayFormat === 'percent') {
            return {
                endAdornment: <InputAdornment position="end">%</InputAdornment>
            };
        }
        return {};
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="500">
                    Variables
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {activeModel.name}
                </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                {modelVariables.map((variable) => (
                    <Card
                        key={variable.id}
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                            }
                        }}
                    >
                        <CardContent sx={{ flex: 1, pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {variable.name}
                                    {variable.description && (
                                        <Tooltip title={variable.description} arrow placement="top">
                                            <IconButton size="small" sx={{ p: 0 }}>
                                                <InfoIcon fontSize="inherit" color="action" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                value={
                                    editingValues[variable.id] !== undefined
                                        ? editingValues[variable.id]
                                        : variable.displayFormat === 'percent'
                                            ? (variable.value * 100).toString()
                                            : variable.displayFormat === 'currency'
                                                ? variable.value.toString()
                                                : variable.value.toString()
                                }
                                onChange={(e) => handleInputChange(variable, e.target.value)}
                                onBlur={() => handleInputBlur(variable)}
                                onKeyDown={(e) => handleKeyDown(e, variable)}
                                InputProps={getInputProps(variable)}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: '#e0e0e0',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                                inputProps={{
                                    'aria-label': `Edit ${variable.name}`,
                                    sx: { textAlign: variable.displayFormat === 'percent' ? 'right' : 'left' }
                                }}
                            />

                            <Typography variant="body2" color="text.secondary" mt={1}>
                                Current: {formatVariableValue(variable)}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>
        </Paper>
    );
}; 