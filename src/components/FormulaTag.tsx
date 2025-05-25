import React, { useState } from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { FormulaToken } from '../store/formulaStore';

interface FormulaTagProps {
    token: FormulaToken;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

export const FormulaTag: React.FC<FormulaTagProps> = ({
    token,
    isSelected,
    onSelect,
    onDelete,
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
        onSelect(token.id);
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDelete = () => {
        onDelete(token.id);
    };

    const getTagInfo = () => {
        switch (token.value.charAt(0)) {
            case 'B': // Base salary
                return { color: '#2196f3', bgColor: '#e3f2fd', icon: '$' };
            case 'C': // Current valuation
                return { color: '#1976d2', bgColor: '#e3f2fd', icon: '$' };
            case 'E': // Exit valuation
                return { color: '#0d47a1', bgColor: '#e3f2fd', icon: '$' };
            case 'A': // Annual equity comp
                return { color: '#4caf50', bgColor: '#e8f5e9', icon: '$' };
            case 'O': // Option grant
                return { color: '#00796b', bgColor: '#e0f2f1', icon: '%' };
            case 'V': // Vesting period
                return { color: '#0097a7', bgColor: '#e0f7fa', icon: '#' };
            case 'F': // Future dilution
                return { color: '#00838f', bgColor: '#e0f7fa', icon: '%' };
            case 'S': // SUM, etc.
                return { color: '#673ab7', bgColor: '#ede7f6', icon: 'ƒ' };
            case 'AV': // AVERAGE, etc.
                return { color: '#5e35b1', bgColor: '#ede7f6', icon: 'ƒ' };
            case 'M': // MIN, MAX, etc.
                return { color: '#512da8', bgColor: '#ede7f6', icon: 'ƒ' };
            default:
                return { color: '#757575', bgColor: '#f5f5f5', icon: '' };
        }
    };

    const tagInfo = getTagInfo();

    return (
        <Box
            onClick={() => onSelect(token.id)}
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                m: '0 4px',
                position: 'relative',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: tagInfo.bgColor,
                    color: tagInfo.color,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    border: isSelected ? `2px solid ${tagInfo.color}` : '1px solid transparent',
                    boxShadow: isSelected ? `0 0 0 1px ${tagInfo.color}20` : 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: `0 2px 4px ${tagInfo.color}20`,
                    },
                }}
            >
                {tagInfo.icon && (
                    <Typography
                        variant="body2"
                        component="span"
                        sx={{
                            mr: 0.5,
                            fontSize: '12px',
                            opacity: 0.8,
                        }}
                    >
                        {tagInfo.icon}
                    </Typography>
                )}
                <Typography variant="body2" fontWeight="medium">
                    {token.value}
                </Typography>
                <Box
                    onClick={handleDelete}
                    sx={{
                        ml: 0.5,
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        opacity: 0.6,
                        '&:hover': {
                            opacity: 1,
                        },
                    }}
                >
                    ×
                </Box>
            </Box>
            <Box
                onClick={handleClick}
                sx={{
                    cursor: 'pointer',
                    color: tagInfo.color,
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '-4px',
                    zIndex: 2,
                }}
            >
                <ArrowDropDownIcon fontSize="small" />
            </Box>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                elevation={3}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
            >
                <MenuItem onClick={handleClose} dense>Edit</MenuItem>
                <MenuItem onClick={handleDelete} dense>Delete</MenuItem>
                <MenuItem onClick={handleClose} dense>Copy</MenuItem>
            </Menu>
        </Box>
    );
}; 