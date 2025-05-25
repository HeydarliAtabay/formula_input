import React from 'react';
import { Box, Typography, Paper, IconButton, Tooltip, List, ListItem, ListItemText, ListItemSecondaryAction } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useFormulaStore } from '../store/formulaStore';
import { format } from 'date-fns';

export const SavedFormulas: React.FC = () => {
    const { savedFormulas, deleteSavedFormula, loadSavedFormula } = useFormulaStore();

    if (savedFormulas.length === 0) {
        return (
            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    mt: 2,
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}
            >
                <Typography variant="body2" color="text.secondary" align="center">
                    No saved formulas yet. Create and save a formula to see it here.
                </Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={3}
            sx={{
                width: '100%',
                p: 2,
                mt: 3,
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
            }}
        >
            <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem', fontWeight: 600 }}>
                Saved Formulas
            </Typography>

            <List sx={{ width: '100%' }}>
                {savedFormulas.map((formula) => (
                    <ListItem
                        key={formula.id}
                        sx={{
                            borderBottom: '1px solid #e0e0e0',
                            '&:last-child': { borderBottom: 'none' },
                            py: 1
                        }}
                    >
                        <ListItemText
                            primary={
                                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                                    {formula.name}
                                </Typography>
                            }
                            secondary={
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                        Result: {formula.result}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Saved on {format(formula.timestamp, 'MMM d, yyyy h:mm a')}
                                    </Typography>
                                </Box>
                            }
                        />
                        <ListItemSecondaryAction>
                            <Tooltip title="Load formula">
                                <IconButton
                                    edge="end"
                                    aria-label="load"
                                    onClick={() => loadSavedFormula(formula.id)}
                                    size="small"
                                    sx={{ mr: 1 }}
                                >
                                    <PlayArrowIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                                <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => deleteSavedFormula(formula.id)}
                                    size="small"
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
}; 