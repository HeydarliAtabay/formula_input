import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Chart } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement } from 'chart.js';
import { useFormulaStore } from '../store/formulaStore';
import { VariableEditor } from './VariableEditor';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement);

export const Dashboard: React.FC = () => {
    const { linkedModels, variableValues } = useFormulaStore();
    const activeModel = linkedModels.find(model => model.isActive);

    if (!activeModel) return null;

    // Get variables for the active model
    const modelVariables = variableValues.filter(v => v.modelId === activeModel.id);

    // Chart data and options depend on the active model
    const getChartData = () => {
        if (activeModel.id === 'comp-calc') {
            const baseSalary = modelVariables.find(v => v.name === 'Base salary')?.value || 0;
            const equityComp = modelVariables.find(v => v.name === 'Annual equity comp')?.value || 0;

            return {
                labels: ['Base Salary', 'Equity Comp', 'Total'],
                datasets: [
                    {
                        label: 'Compensation Breakdown',
                        data: [baseSalary, equityComp, baseSalary + equityComp],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
        } else if (activeModel.id === 'equity-analyzer') {
            const optionGrant = modelVariables.find(v => v.name === 'Option grant')?.value || 0;
            const currentValuation = modelVariables.find(v => v.name === 'Current valuation')?.value || 0;
            const exitValuation = modelVariables.find(v => v.name === 'Exit valuation')?.value || 0;
            const futureDilution = modelVariables.find(v => v.name === 'Future dilution')?.value || 0;

            const currentValue = optionGrant * currentValuation;
            const exitValue = optionGrant * (1 - futureDilution) * exitValuation;

            return {
                labels: ['Current Value', 'Exit Value (After Dilution)'],
                datasets: [
                    {
                        label: 'Equity Value',
                        data: [currentValue, exitValue],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(153, 102, 255, 0.6)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(153, 102, 255, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
        } else {
            // Performance metrics or fallback
            return {
                labels: ['Base Salary', 'Annual Equity', 'Total Compensation'],
                datasets: [
                    {
                        label: 'Financial Metrics',
                        data: [175000, 62500, 237500],
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            };
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: activeModel.id === 'comp-calc'
                    ? 'Compensation Breakdown'
                    : activeModel.id === 'equity-analyzer'
                        ? 'Equity Valuation Analysis'
                        : 'Performance Metrics',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            if (context.parsed.y >= 1000) {
                                label += new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: context.parsed.y >= 1000000 ? 'compact' : 'standard',
                                }).format(context.parsed.y);
                            } else {
                                label += context.parsed.y;
                            }
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        if (value >= 1000) {
                            return new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: value >= 1000000 ? 'compact' : 'standard',
                            }).format(value);
                        }
                        return value;
                    }
                }
            }
        }
    };

    // Alternate chart for pie/doughnut display
    const getPieChartData = () => {
        if (activeModel.id === 'comp-calc') {
            const baseSalary = modelVariables.find(v => v.name === 'Base salary')?.value || 0;
            const equityComp = modelVariables.find(v => v.name === 'Annual equity comp')?.value || 0;

            return {
                labels: ['Base Salary', 'Equity Comp'],
                datasets: [
                    {
                        data: [baseSalary, equityComp],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
        } else if (activeModel.id === 'equity-analyzer') {
            const futureDilution = modelVariables.find(v => v.name === 'Future dilution')?.value || 0;

            return {
                labels: ['Your Equity After Dilution', 'Future Dilution'],
                datasets: [
                    {
                        data: [1 - futureDilution, futureDilution],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 99, 132, 0.6)',
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
        } else {
            // Performance metrics or fallback
            return {
                labels: ['Performance Metrics'],
                datasets: [
                    {
                        data: [100],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.6)',
                        ],
                        borderColor: [
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1,
                    },
                ],
            };
        }
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: activeModel.id === 'comp-calc'
                    ? 'Compensation Ratio'
                    : activeModel.id === 'equity-analyzer'
                        ? 'Dilution Impact'
                        : 'Metrics Distribution',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }

                        if (activeModel.id === 'equity-analyzer') {
                            // For equity-analyzer, show percentages
                            return label + new Intl.NumberFormat('en-US', {
                                style: 'percent',
                                minimumFractionDigits: 1,
                            }).format(context.parsed);
                        } else {
                            // For other models, show currency
                            return label + new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: context.parsed >= 1000000 ? 'compact' : 'standard',
                            }).format(context.parsed);
                        }
                    }
                }
            }
        }
    };

    // Add a line chart for projections
    const getLineChartData = () => {
        // Generate years for projection (5 years)
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

        if (activeModel.id === 'comp-calc') {
            const baseSalary = modelVariables.find(v => v.name === 'Base salary')?.value || 0;
            const equityComp = modelVariables.find(v => v.name === 'Annual equity comp')?.value || 0;

            // Project 5% annual growth for salary and 10% for equity
            const salaryData = years.map((_, i) => baseSalary * Math.pow(1.05, i));
            const equityData = years.map((_, i) => equityComp * Math.pow(1.1, i));
            const totalData = years.map((_, i) => salaryData[i] + equityData[i]);

            return {
                labels: years.map(year => year.toString()),
                datasets: [
                    {
                        label: 'Base Salary',
                        data: salaryData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        tension: 0.3,
                    },
                    {
                        label: 'Equity Compensation',
                        data: equityData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                    },
                    {
                        label: 'Total Compensation',
                        data: totalData,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        tension: 0.3,
                    }
                ],
            };
        } else if (activeModel.id === 'equity-analyzer') {
            const optionGrant = modelVariables.find(v => v.name === 'Option grant')?.value || 0;
            const currentValuation = modelVariables.find(v => v.name === 'Current valuation')?.value || 0;
            const exitValuation = modelVariables.find(v => v.name === 'Exit valuation')?.value || 0;
            const futureDilution = modelVariables.find(v => v.name === 'Future dilution')?.value || 0;

            // Calculate valuation growth over 5 years
            const valuationStep = (exitValuation - currentValuation) / 4;
            const valuations = years.map((_, i) => currentValuation + (valuationStep * i));

            // Calculate dilution over time (not linear, but increasing)
            const dilutionData = years.map((_, i) => i === 0 ? 0 : futureDilution * (i / 4));

            // Calculate equity value over time
            const equityValues = years.map((_, i) =>
                optionGrant * (1 - dilutionData[i]) * valuations[i]
            );

            return {
                labels: years.map(year => year.toString()),
                datasets: [
                    {
                        label: 'Company Valuation',
                        data: valuations,
                        borderColor: 'rgba(255, 159, 64, 1)',
                        backgroundColor: 'rgba(255, 159, 64, 0.2)',
                        tension: 0.3,
                        yAxisID: 'y-valuation',
                    },
                    {
                        label: 'Your Equity Value',
                        data: equityValues,
                        borderColor: 'rgba(153, 102, 255, 1)',
                        backgroundColor: 'rgba(153, 102, 255, 0.2)',
                        tension: 0.3,
                        yAxisID: 'y-equity',
                    },
                ],
            };
        } else {
            // Performance metrics
            const baseSalary = 175000;
            const vestingPeriod = modelVariables.find(v => v.name === 'Vesting period')?.value || 4;

            // Calculate vesting percentages
            const vestingData = years.map((_, i) => Math.min(1, (i + 1) / vestingPeriod) * 100);

            return {
                labels: years.map(year => year.toString()),
                datasets: [
                    {
                        label: 'Vesting Percentage',
                        data: vestingData,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.3,
                    }
                ],
            };
        }
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
            title: {
                display: true,
                text: activeModel.id === 'comp-calc'
                    ? '5-Year Compensation Projection'
                    : activeModel.id === 'equity-analyzer'
                        ? 'Equity Value Projection'
                        : 'Vesting Schedule',
                font: {
                    size: 16,
                    weight: 'bold' as const,
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }

                        if (activeModel.id === 'performance-metrics') {
                            // For performance metrics, show percentages
                            return label + new Intl.NumberFormat('en-US', {
                                style: 'percent',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                            }).format(context.parsed.y / 100);
                        } else {
                            // For other models, show currency
                            return label + new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: context.parsed.y >= 1000000 ? 'compact' : 'standard',
                            }).format(context.parsed.y);
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        if (activeModel.id === 'performance-metrics') {
                            return value + '%';
                        } else {
                            if (value >= 1000) {
                                return new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: value >= 1000000 ? 'compact' : 'standard',
                                }).format(value);
                            }
                            return value;
                        }
                    }
                }
            },
            'y-valuation': {
                type: 'linear' as const,
                display: activeModel.id === 'equity-analyzer',
                position: 'left' as const,
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                        }).format(value);
                    }
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
            'y-equity': {
                type: 'linear' as const,
                display: activeModel.id === 'equity-analyzer',
                position: 'right' as const,
                beginAtZero: true,
                ticks: {
                    callback: function (value: any) {
                        return new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            notation: 'compact',
                        }).format(value);
                    }
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                {activeModel.name} Dashboard
            </Typography>

            {/* Variable Editor */}
            <VariableEditor />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        width: { xs: '100%', md: 'calc(50% - 12px)' }
                    }}
                >
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Chart type="bar" data={getChartData()} options={chartOptions} />
                    </Box>
                </Paper>
                <Paper
                    elevation={2}
                    sx={{
                        p: 2,
                        height: 400,
                        display: 'flex',
                        flexDirection: 'column',
                        width: { xs: '100%', md: 'calc(50% - 12px)' }
                    }}
                >
                    <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <Chart type="doughnut" data={getPieChartData()} options={pieChartOptions} />
                    </Box>
                </Paper>
            </Box>

            {/* Line Chart */}
            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    mb: 3,
                    height: 400,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                    <Chart type="line" data={getLineChartData()} options={lineChartOptions} />
                </Box>
            </Paper>

            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    mt: 2,
                }}
            >
                <Typography variant="h6" gutterBottom>
                    {activeModel.id === 'comp-calc'
                        ? 'Compensation Summary'
                        : activeModel.id === 'equity-analyzer'
                            ? 'Equity Analysis Summary'
                            : 'Performance Summary'}
                </Typography>
                <Typography variant="body1" paragraph>
                    {activeModel.id === 'comp-calc'
                        ? `Your total annual compensation package is worth ${new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                        }).format((modelVariables.find(v => v.name === 'Base salary')?.value || 0) +
                            (modelVariables.find(v => v.name === 'Annual equity comp')?.value || 0))}.`
                        : activeModel.id === 'equity-analyzer'
                            ? `Your current equity is worth ${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                                notation: 'compact',
                            }).format((modelVariables.find(v => v.name === 'Option grant')?.value || 0) *
                                (modelVariables.find(v => v.name === 'Current valuation')?.value || 0))}.
                                  At exit, it could be worth ${new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD',
                                    notation: 'compact',
                                }).format((modelVariables.find(v => v.name === 'Option grant')?.value || 0) *
                                    (1 - (modelVariables.find(v => v.name === 'Future dilution')?.value || 0)) *
                                    (modelVariables.find(v => v.name === 'Exit valuation')?.value || 0))}.`
                            : 'Performance metrics summary based on your input values.'}
                </Typography>
            </Paper>
        </Box>
    );
}; 