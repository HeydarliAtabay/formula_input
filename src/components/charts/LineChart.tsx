import React from 'react';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

interface LineChartProps {
    title: string;
    data: any[];
    xAxisKey: string;
    lines: {
        dataKey: string;
        color: string;
        name: string;
    }[];
}

export const LineChart: React.FC<LineChartProps> = ({ title, data, xAxisKey, lines }) => {
    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
        }
        return `$${value}`;
    };

    return (
        <Paper
            elevation={2}
            sx={{
                p: 2,
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                mb: 3,
                overflow: 'hidden',
            }}
        >
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="medium" color="text.primary">
                    {title}
                </Typography>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey={xAxisKey}
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e0e0e0' }}
                        tickLine={{ stroke: '#e0e0e0' }}
                    />
                    <Tooltip
                        formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        }}
                    />
                    <Legend wrapperStyle={{ paddingTop: 10 }} />
                    {lines.map((line, index) => (
                        <Line
                            key={index}
                            type="monotone"
                            dataKey={line.dataKey}
                            name={line.name}
                            stroke={line.color}
                            strokeWidth={2}
                            dot={{ r: 3, strokeWidth: 1 }}
                            activeDot={{ r: 5, strokeWidth: 1 }}
                        />
                    ))}
                </RechartsLineChart>
            </ResponsiveContainer>
        </Paper>
    );
}; 