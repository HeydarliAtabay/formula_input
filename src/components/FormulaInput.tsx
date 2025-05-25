import React, { useRef, useState, useEffect } from 'react';
import { Box, TextField, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { FormulaTag } from './FormulaTag';
import { Suggestions } from './Suggestions';
import { SavedFormulas } from './SavedFormulas';
import { useFormulaStore } from '../store/formulaStore';
import { useAutocomplete } from '../hooks/useAutocomplete';
import type { FormulaTag as FormulaTagType } from '../store/formulaStore';

export const FormulaInput: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [formulaName, setFormulaName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const saveInputRef = useRef<HTMLInputElement>(null);

    const {
        tokens,
        cursorPosition,
        selectedTagId,
        result,
        addToken,
        insertText,
        deleteToken,
        moveBackward,
        moveForward,
        deleteBackward,
        selectTag,
        evaluateFormula,
        clearTokens,
        saveFormula
    } = useFormulaStore();

    const { data: suggestions = [], isLoading } = useAutocomplete(inputValue);

    // Focus the input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Handle keyboard navigation and operations
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle special keys
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                moveBackward();
                break;
            case 'ArrowRight':
                e.preventDefault();
                moveForward();
                break;
            case 'Backspace':
                if (inputValue === '') {
                    e.preventDefault();
                    deleteBackward();
                }
                break;
            case 'Enter':
                e.preventDefault();
                if (showSuggestions && suggestions.length > 0) {
                    handleSuggestionSelect(suggestions[0]);
                } else {
                    evaluateFormula();
                }
                break;
            case '+':
            case '-':
            case '*':
            case '/':
            case '^':
            case '(':
            case ')':
                e.preventDefault();
                insertText(e.key);
                break;
            default:
                // For other keys, let the input handle them normally
                break;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Simply update the input value for autocomplete
        setInputValue(value);

        // Show suggestions if there's text
        if (value.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionSelect = (suggestion: FormulaTagType) => {
        // Add the tag to the formula
        addToken({
            type: 'tag',
            value: suggestion.value,
        });

        // Clear the input and hide suggestions
        setInputValue('');
        setShowSuggestions(false);

        // Focus back on the input after selection
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleReset = () => {
        clearTokens();
        setInputValue('');
        setShowSuggestions(false);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleSaveClick = () => {
        // First calculate the result if needed
        if (!result) {
            evaluateFormula();
        }
        setSaveDialogOpen(true);
    };

    const handleSaveDialogClose = () => {
        setSaveDialogOpen(false);
        setFormulaName('');
    };

    const handleSaveFormula = () => {
        if (formulaName.trim()) {
            saveFormula(formulaName.trim());
            setSaveDialogOpen(false);
            setFormulaName('');
        }
    };

    // Render tokens and cursor
    const renderFormula = () => {
        const elements: React.ReactNode[] = [];

        // Create a copy of tokens to render them in order
        const tokensToRender = [...tokens];

        // Render tokens before cursor position
        tokensToRender.forEach((token, index) => {
            if (token.type === 'tag') {
                elements.push(
                    <FormulaTag
                        key={token.id}
                        token={token}
                        isSelected={token.id === selectedTagId}
                        onSelect={selectTag}
                        onDelete={deleteToken}
                    />
                );
            } else {
                elements.push(
                    <Typography
                        key={token.id}
                        variant="body1"
                        component="span"
                        sx={{ mx: 0.5 }}
                    >
                        {token.value}
                    </Typography>
                );
            }
        });

        if (cursorPosition <= tokens.length) {
            elements.splice(
                cursorPosition,
                0,
                <Box
                    key="cursor"
                    component="span"
                    sx={{
                        display: 'inline-block',
                        width: '2px',
                        height: '20px',
                        backgroundColor: 'primary.main',
                        animation: 'blink 1s infinite',
                        verticalAlign: 'middle',
                        mx: 0.5,
                    }}
                />
            );
        }

        return elements;
    };

    const exampleFormulas = [
        { display: "Base salary * (1 + 0.05)", value: ["Base salary", "*", "(", "1", "+", "0.05", ")"] },
        { display: "Base salary + Option grant * Current valuation", value: ["Base salary", "+", "Option grant", "*", "Current valuation"] },
        { display: "Base salary + Annual equity comp", value: ["Base salary", "+", "Annual equity comp"] }
    ];

    const applyExampleFormula = (formula: string[]) => {
        clearTokens();

        formula.forEach((part, index) => {
            if (['Base salary', 'Annual equity comp', 'Option grant', 'Current valuation', 'Exit valuation', 'Vesting period', 'Future dilution'].includes(part)) {
                const matchingVar = suggestions.find(s => s.value === part) || {
                    id: crypto.randomUUID(),
                    type: 'variable',
                    value: part,
                    display: part
                };

                addToken({
                    type: 'tag',
                    value: matchingVar.value,
                });
            } else {
                insertText(part);
            }

            // Don't add a space after the last item
            if (index < formula.length - 1) {
                // Add space between elements, except before certain operators
                const nextPart = formula[index + 1];
                if (!['+', '-', '*', '/', ')', '('].includes(nextPart) &&
                    !['+', '-', '*', '/', '('].includes(part)) {
                    insertText(' ');
                }
            }
        });

        setTimeout(() => {
            evaluateFormula();
        }, 100);
    };

    // Handle direct typing of characters not covered by the input field
    const handleCharacterKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Only handle character keys when the input is not focused
        if (document.activeElement !== inputRef.current) {
            const key = e.key;
            if (key.length === 1) { // Single character keys
                insertText(key);
                e.preventDefault();
            }
        }
    };

    return (
        <>
            <Paper
                elevation={3}
                sx={{
                    width: '100%',
                    p: 2,
                    mb: 2,
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                }}
            >
                <Box
                    ref={containerRef}
                    onClick={handleContainerClick}
                    onKeyDown={handleCharacterKeyDown}
                    tabIndex={-1} // Make div focusable but not in tab order
                    sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '6px',
                        p: 1.5,
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        position: 'relative',
                        backgroundColor: '#fff',
                        '&:focus-within': {
                            borderColor: 'primary.main',
                            boxShadow: '0 0 0 2px rgba(63, 81, 181, 0.2)',
                        },
                    }}
                >
                    {tokens.length === 0 && !inputValue && (
                        <Typography
                            variant="body1"
                            sx={{
                                color: 'text.secondary',
                                position: 'absolute',
                                pointerEvents: 'none',
                            }}
                        >
                            Enter a formula...
                        </Typography>
                    )}
                    {renderFormula()}
                    <TextField
                        inputRef={inputRef}
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        variant="standard"
                        sx={{
                            minWidth: '4px',
                            maxWidth: inputValue ? '180px' : '4px',
                            flexGrow: 0,
                            transition: 'max-width 0.2s',
                            '& .MuiInput-root': {
                                border: 'none',
                                '&:before, &:after': {
                                    display: 'none',
                                },
                            },
                            '& .MuiInputBase-input': {
                                p: 0.5,
                                width: '100%',
                            },
                        }}
                    />
                    <Suggestions
                        suggestions={suggestions}
                        loading={isLoading}
                        onSelect={handleSuggestionSelect}
                        visible={showSuggestions && inputValue.length > 0}
                    />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleReset}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            Clear
                        </Button>
                        {tokens.length > 0 && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<SaveIcon fontSize="small" />}
                                onClick={handleSaveClick}
                                sx={{ fontSize: '0.75rem' }}
                            >
                                Save
                            </Button>
                        )}
                    </Box>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={evaluateFormula}
                        sx={{ fontSize: '0.75rem' }}
                    >
                        Calculate
                    </Button>
                </Box>

                {result && (
                    <Box mt={2} p={1.5} bgcolor="#f8f9fa" borderRadius={1.5}>
                        <Typography variant="body1" fontWeight="medium">Result: {result}</Typography>
                    </Box>
                )}

                <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                        Example formulas:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {exampleFormulas.map((formula, index) => (
                            <Box
                                key={index}
                                sx={{
                                    p: 1,
                                    backgroundColor: '#f1f3f5',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: '#e9ecef'
                                    }
                                }}
                                onClick={() => applyExampleFormula(formula.value)}
                            >
                                <Typography variant="body2" fontFamily="monospace">
                                    {formula.display}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Dialog
                    open={saveDialogOpen}
                    onClose={handleSaveDialogClose}
                    PaperProps={{
                        sx: { borderRadius: '8px', width: '100%', maxWidth: '400px' }
                    }}
                >
                    <DialogTitle sx={{ pb: 1 }}>Save Formula</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Formula Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={formulaName}
                            onChange={(e) => setFormulaName(e.target.value)}
                            inputRef={saveInputRef}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSaveFormula();
                                }
                            }}
                            sx={{ mt: 1 }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button onClick={handleSaveDialogClose} variant="outlined" size="small">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveFormula}
                            variant="contained"
                            size="small"
                            disabled={!formulaName.trim()}
                        >
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>

            <SavedFormulas />
        </>
    );
}; 