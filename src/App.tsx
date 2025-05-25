import { useState } from 'react'
import { Box, Container, Typography, CssBaseline, ThemeProvider, createTheme, Tabs, Tab, Paper } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { FormulaInput } from './components/FormulaInput'
import { Dashboard } from './components/Dashboard'
import { LinkedModels } from './components/LinkedModels'
import { useFormulaStore } from './store/formulaStore'

// Create a client
const queryClient = new QueryClient()

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
    }
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
})

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const { linkedModels } = useFormulaStore();

  const activeModel = linkedModels.find(model => model.isActive);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Render content based on active model and tab
  const renderContent = () => {
    if (!activeModel) return null;

    // Compensation Calculator content
    if (activeModel.id === 'comp-calc') {
      if (activeTab === 0) {
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter your compensation formula below:
            </Typography>
            <FormulaInput />

            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Instructions:
              </Typography>
              <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
                <li>Type variable names or functions to see autocomplete suggestions</li>
                <li>Use operators: +, -, *, /, ^, (, )</li>
                <li>Press Enter to evaluate the formula</li>
                <li>Use arrow keys to navigate</li>
                <li>Click on tags to select them</li>
              </Typography>
            </Box>
          </Box>
        );
      } else {
        return <Dashboard />;
      }
    }

    // Equity Analysis content
    else if (activeModel.id === 'equity-analyzer') {
      if (activeTab === 0) {
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter your equity analysis formula below:
            </Typography>
            <FormulaInput />

            <Box mt={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Equity Variables Available:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Option grant:</strong> {new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 3 }).format(0.005)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Current valuation:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(50000000)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Exit valuation:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(1000000000)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Future dilution:</strong> {new Intl.NumberFormat('en-US', { style: 'percent' }).format(0.3)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        );
      } else {
        return <Dashboard />;
      }
    }

    // Performance Metrics content
    else if (activeModel.id === 'performance-metrics') {
      if (activeTab === 0) {
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Enter your performance metrics formula below:
            </Typography>
            <FormulaInput />

            <Box mt={4}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Performance Variables Available:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Base salary:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(175000)}
                    </Typography>
                  </Box>
                  <Box sx={{ width: 'calc(50% - 8px)' }}>
                    <Typography variant="body2">
                      <strong>Annual equity comp:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(62500)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        );
      } else {
        return <Dashboard />;
      }
    }

    return null;
  };

  // Determine page title based on active model
  const getPageTitle = () => {
    if (!activeModel) return "Employee Compensation Calculator";
    return activeModel.name;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="500">
            {getPageTitle()}
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Formula Input" />
              <Tab label="Dashboard" />
            </Tabs>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ width: { xs: '100%', md: '250px', lg: '280px' }, flexShrink: 0 }}>
              <LinkedModels />
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              {renderContent()}
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
