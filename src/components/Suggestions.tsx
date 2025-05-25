import React from 'react';
import { Box, List, ListItem, ListItemText, Paper, Typography, CircularProgress } from '@mui/material';
import type { FormulaTag } from '../store/formulaStore';

interface SuggestionsProps {
    suggestions: FormulaTag[];
    loading: boolean;
    onSelect: (suggestion: FormulaTag) => void;
    visible: boolean;
}

export const Suggestions: React.FC<SuggestionsProps> = ({
    suggestions,
    loading,
    onSelect,
    visible,
}) => {
    if (!visible) return null;

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'absolute',
                top: '100%',
                left: 0,
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                mt: 1,
                border: '1px solid #ddd',
            }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : suggestions.length === 0 ? (
                <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                    No suggestions found
                </Typography>
            ) : (
                <List disablePadding>
                    {suggestions.map((suggestion) => (
                        <ListItem
                            key={suggestion.id}
                            onClick={() => onSelect(suggestion)}
                            sx={{
                                cursor: 'pointer',
                                '&:hover': {
                                    backgroundColor: 'action.hover',
                                },
                                padding: '4px 8px',
                            }}
                        >
                            <ListItemText
                                primary={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Box
                                            sx={{
                                                height: '12px',
                                                width: '12px',
                                                borderRadius: '2px',
                                                backgroundColor:
                                                    suggestion.type === 'variable'
                                                        ? '#3498db'
                                                        : suggestion.type === 'function'
                                                            ? '#9b59b6'
                                                            : '#e74c3c',
                                                mr: 1,
                                            }}
                                        />
                                        <Typography variant="body2">
                                            {suggestion.display}
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {suggestion.type}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
}; 