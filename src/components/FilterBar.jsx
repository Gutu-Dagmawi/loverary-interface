import { useState } from 'react';
import { 
  Slider, 
  Typography, 
  Box, 
  Divider, 
  Button,
  Collapse,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText
} from '@mui/material';
import { ExpandMore, ExpandLess, FilterAltOutlined, FilterAlt } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const priceMarks = [
  { value: 0, label: '₾0' },
  { value: 10, label: '₾10' },
  { value: 20, label: '₾20' },
  { value: 30, label: '₾30+' },
];

const authors = [
  'Leo Tolstoy',
  'Fyodor Dostoevsky'
];

const categories = [
  'Classic Literature',
  'Philosophy',
  'Russian Literature'
];

const stockStatus = [
  { value: 'in_stock', label: 'In Stock' },
  { value: 'low_stock', label: 'Low Stock' },
  { value: 'out_of_stock', label: 'Out of Stock' }
];

const StyledFilterSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  '&:last-child': {
    marginBottom: 0,
  },
}));

const FilterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(1),
  cursor: 'pointer',
  '&:hover': {
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.main,
    },
  },
}));

const FilterTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export default function FilterBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    priceRange: [0, 30],
    authors: [],
    categories: [],
    stockStatus: []
  });

  const [expandedSections, setExpandedSections] = useState({
    price: true,
    authors: true,
    categories: true,
    stockStatus: true
  });

  const hasActiveFilters = 
    filters.priceRange[0] > 0 || 
    filters.priceRange[1] < 30 ||
    filters.authors.length > 0 ||
    filters.categories.length > 0 ||
    filters.stockStatus.length > 0;

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value
    };
    
    setFilters(newFilters);
    onFilterChange({
      priceRange: newFilters.priceRange,
      authors: newFilters.authors,
      categories: newFilters.categories,
      stockStatus: newFilters.stockStatus
    });
  };

  const handlePriceChange = (event, newValue) => {
    handleFilterChange('priceRange', newValue);
  };

  const handleAuthorChange = (event) => {
    handleFilterChange('authors', event.target.value);
  };

  const handleCategoryChange = (event) => {
    handleFilterChange('categories', event.target.value);
  };

  const handleStockStatusChange = (event) => {
    handleFilterChange('stockStatus', event.target.value);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const resetFilters = () => {
    const defaultFilters = {
      priceRange: [0, 30],
      authors: [],
      categories: [],
      stockStatus: []
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <Paper 
      elevation={2} 
      sx={{
        width: 300,
        p: 3,
        borderRadius: 2,
        position: 'sticky',
        top: 20,
        maxHeight: 'calc(100vh - 40px)',
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '3px',
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasActiveFilters ? (
            <FilterAlt color="primary" />
          ) : (
            <FilterAltOutlined />
          )}
          Filters
          {hasActiveFilters && (
            <Typography component="span" color="primary" sx={{ fontSize: '0.8rem', ml: 1 }}>
              {[
                filters.priceRange[0] > 0 || filters.priceRange[1] < 30 ? 1 : 0,
                filters.authors.length,
                filters.categories.length,
                filters.stockStatus.length
              ].reduce((a, b) => a + b, 0)} active
            </Typography>
          )}
        </Typography>
        {hasActiveFilters && (
          <Button 
            size="small" 
            onClick={resetFilters}
            sx={{ textTransform: 'none' }}
          >
            Clear all
          </Button>
        )}
      </Box>
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('price')}>
          <FilterTitle variant="subtitle1">
            Price Range
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 30) && (
              <Box component="span" sx={{ color: 'primary.main', fontSize: '0.75rem', ml: 1 }}>
                (₾{filters.priceRange[0]} - ₾{filters.priceRange[1] === 30 ? '30+' : filters.priceRange[1]})
              </Box>
            )}
          </FilterTitle>
          {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.price}>
          <Box sx={{ px: 1, pt: 1 }}>
            <Slider
              value={filters.priceRange}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              marks={priceMarks}
              min={0}
              max={30}
              step={1}
              valueLabelFormat={(value) => `₾${value}`}
              sx={{ mt: 3, mb: 1 }}
            />
          </Box>
        </Collapse>
      </StyledFilterSection>
      
      <Divider sx={{ my: 2 }} />
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('authors')}>
          <FilterTitle variant="subtitle1">
            Authors
            {filters.authors.length > 0 && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                {filters.authors.length}
              </Box>
            )}
          </FilterTitle>
          {expandedSections.authors ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.authors}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                multiple
                displayEmpty
                value={filters.authors}
                onChange={handleAuthorChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>All Authors</em>;
                  }
                  return selected.join(', ');
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                }}
              >
                {authors.map((author) => (
                  <MenuItem key={author} value={author}>
                    <Checkbox checked={filters.authors.indexOf(author) > -1} />
                    <ListItemText primary={author} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </StyledFilterSection>
      
      <Divider sx={{ my: 2 }} />
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('categories')}>
          <FilterTitle variant="subtitle1">
            Categories
            {filters.categories.length > 0 && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                {filters.categories.length}
              </Box>
            )}
          </FilterTitle>
          {expandedSections.categories ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.categories}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                multiple
                displayEmpty
                value={filters.categories}
                onChange={handleCategoryChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>All Categories</em>;
                  }
                  return selected.join(', ');
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    <Checkbox checked={filters.categories.indexOf(category) > -1} />
                    <ListItemText primary={category} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </StyledFilterSection>
      <Divider sx={{ my: 2 }} />
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('stockStatus')}>
          <FilterTitle variant="subtitle1">
            Stock Status
            {filters.stockStatus.length > 0 && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                {filters.stockStatus.length}
              </Box>
            )}
          </FilterTitle>
          {expandedSections.stockStatus ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.stockStatus}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                multiple
                displayEmpty
                value={filters.stockStatus}
                onChange={handleStockStatusChange}
                input={<OutlinedInput />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>All Statuses</em>;
                  }
                  return selected.map(s => 
                    stockStatus.find(ss => ss.value === s)?.label || s
                  ).join(', ');
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                    },
                  },
                }}
              >
                {stockStatus.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    <Checkbox checked={filters.stockStatus.indexOf(status.value) > -1} />
                    <ListItemText primary={status.label} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </StyledFilterSection>
    </Paper>
  );
}
