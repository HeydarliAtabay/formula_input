import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Divider,
    Tooltip,
    Menu,
    MenuItem,
    Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CalculateIcon from '@mui/icons-material/Calculate';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormulaStore } from '../store/formulaStore';
import type { LinkedModel } from '../store/formulaStore';

export const LinkedModels: React.FC = () => {
    const { linkedModels, addLinkedModel, removeLinkedModel, setActiveLinkedModel } = useFormulaStore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newModelName, setNewModelName] = useState('');
    const [newModelType, setNewModelType] = useState('Financial');
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedModelId, setSelectedModelId] = useState<string | null>(null);

    const handleAddClick = () => {
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setNewModelName('');
        setNewModelType('Financial');
    };

    const handleAddModel = () => {
        if (newModelName.trim()) {
            addLinkedModel({
                name: newModelName.trim(),
                type: newModelType,
                color: getRandomColor(),
                icon: getIconForType(newModelType)
            });
            handleCloseDialog();
        }
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>, modelId: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedModelId(modelId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedModelId(null);
    };

    const handleModelClick = (modelId: string) => {
        setActiveLinkedModel(modelId);
    };

    const handleDeleteModel = () => {
        if (selectedModelId) {
            removeLinkedModel(selectedModelId);
            handleMenuClose();
        }
    };

    const getRandomColor = () => {
        const colors = ['#7c4dff', '#2196f3', '#00bcd4', '#009688', '#4caf50', '#ff9800', '#f44336'];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const getIconForType = (type: string): string => {
        switch (type) {
            case 'Financial':
                return 'calculate';
            case 'Analytics':
                return 'bar_chart';
            case 'Data':
                return 'table_chart';
            default:
                return 'calculate';
        }
    };

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const renderModelIcon = (model: LinkedModel) => {
        switch (model.icon) {
            case 'calculate':
                return <CalculateIcon fontSize="small" />;
            case 'bar_chart':
                return <BarChartIcon fontSize="small" />;
            case 'table_chart':
                return <TableChartIcon fontSize="small" />;
            default:
                return <CalculateIcon fontSize="small" />;
        }
    };

    return (
        <Paper
            elevation={1}
            sx={{
                height: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                overflow: 'hidden',
                position: 'sticky',
                top: 20
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    backgroundColor: '#f9f9f9',
                    borderBottom: '1px solid #eaeaea'
                }}
            >
                <Typography variant="subtitle1" fontWeight="600">
                    Models
                </Typography>
            </Box>

            <List disablePadding>
                {linkedModels.map((model) => (
                    <Tooltip
                        key={model.id}
                        title={model.name}
                        placement="right"
                        arrow
                    >
                        <ListItem
                            sx={{
                                py: 1.5,
                                px: 2,
                                backgroundColor: model.isActive ? '#f0f4ff' : 'transparent',
                                '&:hover': { backgroundColor: model.isActive ? '#f0f4ff' : '#f9f9f9' },
                                cursor: 'pointer',
                                borderLeft: model.isActive ? `4px solid ${model.color || '#3f51b5'}` : '4px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                            secondaryAction={
                                <IconButton
                                    edge="end"
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleMenuClick(e, model.id);
                                    }}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            }
                            onClick={() => handleModelClick(model.id)}
                        >
                            <ListItemIcon sx={{ minWidth: 42 }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: model.color || '#3f51b5',
                                        color: '#fff',
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {getInitials(model.name)}
                                </Avatar>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="body2"
                                        color={model.isActive ? 'primary.main' : 'text.primary'}
                                        fontWeight={model.isActive ? 600 : 400}
                                        sx={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            maxWidth: '150px'
                                        }}
                                    >
                                        {model.name}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        {renderModelIcon(model)}
                                        <span>{model.type}</span>
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </Tooltip>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem
                    onClick={handleAddClick}
                    sx={{
                        py: 1.5,
                        px: 2,
                        color: 'primary.main',
                        '&:hover': { backgroundColor: '#f9f9f9' },
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 42, color: 'inherit' }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'rgba(63, 81, 181, 0.1)', color: 'primary.main' }}>
                            <AddIcon fontSize="small" />
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            <Typography variant="body2" color="inherit" fontWeight={500}>
                                Add model
                            </Typography>
                        }
                    />
                </ListItem>
            </List>

            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                PaperProps={{
                    sx: { borderRadius: '8px', width: '100%', maxWidth: '400px' }
                }}
            >
                <DialogTitle>Add New Model</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Model Name"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Model Type"
                        fullWidth
                        variant="outlined"
                        value={newModelType}
                        onChange={(e) => setNewModelType(e.target.value)}
                    >
                        <MenuItem value="Financial">Financial</MenuItem>
                        <MenuItem value="Analytics">Analytics</MenuItem>
                        <MenuItem value="Data">Data</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddModel}
                        variant="contained"
                        disabled={!newModelName.trim()}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { width: 150, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)' }
                }}
            >
                <MenuItem onClick={handleDeleteModel}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                        <DeleteIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Delete" />
                </MenuItem>
            </Menu>
        </Paper>
    );
}; 