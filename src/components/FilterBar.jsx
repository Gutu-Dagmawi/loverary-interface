import { useEffect, useState } from 'react';
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
  ListItemText,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { 
  ExpandMore, 
  ExpandLess, 
  FilterAltOutlined, 
  FilterAlt, 
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../services/api';

// Price range configuration
const PRICE_RANGE = {
  MIN: 0,
  MAX: 1000, // Adjust based on your book prices
  STEP: 10,
  MARKS: [
    { value: 0, label: '₾0' },
    { value: 250, label: '₾250' },
    { value: 500, label: '₾500' },
    { value: 750, label: '₾750' },
    { value: 1000, label: '₾1000+' },
  ]
};

// Stock status options
const STOCK_STATUS = [
  { value: 'in_stock', label: 'In Stock' },
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
  // State for filters
  const [filters, setFilters] = useState({
    min_price: PRICE_RANGE.MIN,
    max_price: PRICE_RANGE.MAX,
    author_id: [],
    category_id: [],
    in_stock: null,
    q: ''
  });

  // State for UI
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    authors: true,
    categories: true,
    stockStatus: true
  });

  // State for dynamic data
  const [authors, setAuthors] = useState([
    // Default empty state to prevent map errors
    { id: 1, name: 'Loading authors...' }
  ]);
  const [categories, setCategories] = useState([
    // Default empty state to prevent map errors
    { id: 1, name: 'Loading categories...' }
  ]);
  const [isLoading, setIsLoading] = useState({
    authors: true,
    categories: true
  });
  const [error, setError] = useState({
    authors: null,
    categories: null
  });

  // Check if any filters are active
  const hasActiveFilters = 
    filters.min_price > PRICE_RANGE.MIN ||
    filters.max_price < PRICE_RANGE.MAX ||
    filters.author_id.length > 0 ||
    filters.category_id.length > 0 ||
    filters.in_stock !== null ||
    filters.q !== '';

  // Fetch authors and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch authors
      try {
        const authorsUrl = '/authors';
        const fullAuthorsUrl = new URL(authorsUrl, window.location.origin).toString();
        console.log('[FilterBar] Fetching authors from:', fullAuthorsUrl);
        
        setIsLoading(prev => ({ ...prev, authors: true }));
        setError(prev => ({ ...prev, authors: null }));
        
        const startTime = performance.now();
        const authorsRes = await api.get(authorsUrl);
        const endTime = performance.now();
        
        console.log(`[FilterBar] Received authors response in ${(endTime - startTime).toFixed(2)}ms`, {
          status: authorsRes.status,
          statusText: authorsRes.statusText,
          data: authorsRes.data,
          headers: authorsRes.headers
        });
        
        setAuthors(authorsRes.data || []);
      } catch (err) {
        console.error('[FilterBar] Error fetching authors:', {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          } : 'No response',
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        setError(prev => ({ ...prev, authors: 'Failed to load authors' }));
        setAuthors([{ id: 'error', name: 'Error loading authors' }]);
      } finally {
        setIsLoading(prev => ({ ...prev, authors: false }));
      }

      // Fetch categories
      try {
        const categoriesUrl = '/categories';
        const fullCategoriesUrl = new URL(categoriesUrl, window.location.origin).toString();
        console.log('[FilterBar] Fetching categories from:', fullCategoriesUrl);
        
        setIsLoading(prev => ({ ...prev, categories: true }));
        setError(prev => ({ ...prev, categories: null }));
        
        const startTime = performance.now();
        const categoriesRes = await api.get(categoriesUrl);
        const endTime = performance.now();
        
        console.log(`[FilterBar] Received categories response in ${(endTime - startTime).toFixed(2)}ms`, {
          status: categoriesRes.status,
          statusText: categoriesRes.statusText,
          data: categoriesRes.data,
          headers: categoriesRes.headers
        });
        
        setCategories(categoriesRes.data || []);
      } catch (err) {
        console.error('[FilterBar] Error fetching categories:', {
          message: err.message,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          } : 'No response',
          config: {
            url: err.config?.url,
            method: err.config?.method,
            headers: err.config?.headers
          }
        });
        setError(prev => ({ ...prev, categories: 'Failed to load categories' }));
        setCategories([{ id: 'error', name: 'Error loading categories' }]);
      } finally {
        setIsLoading(prev => ({ ...prev, categories: false }));
      }
    };

    fetchData();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    console.log(`[FilterBar] Filter changed - ${filterName}:`, value);
    
    // Update the filters state
    setFilters(prevFilters => {
      const newFilters = { 
        ...prevFilters, 
        [filterName]: value,
        // Reset page to 1 when filters change
        ...(filterName !== 'page' && { page: 1 })
      };
      
      console.log('[FilterBar] New filters:', newFilters);
      
      // Call the parent's onFilterChange with the updated filters
      if (onFilterChange) {
        onFilterChange(newFilters);
      }
      
      return newFilters;
    });
  };

  const handlePriceChange = (event, newValue) => {
    handleFilterChange('min_price', newValue[0]);
    handleFilterChange('max_price', newValue[1]);
  };

  const handleAuthorChange = (event) => {
    handleFilterChange('author_id', event.target.value);
  };

  const handleCategoryChange = (event) => {
    handleFilterChange('category_id', event.target.value);
  };

  const handleStockStatusChange = (event) => {
    const value = event.target.value;
    // Toggle between null and true for in_stock
    handleFilterChange('in_stock', value === 'in_stock' ? true : null);
  };

  const handleSearchChange = (event) => {
    handleFilterChange('q', event.target.value);
  };

  const handleClearSearch = () => {
    handleFilterChange('q', '');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleClearFilters = () => {
    console.log('[FilterBar] Clearing all filters');
    const resetFilters = {
      min_price: PRICE_RANGE.MIN,
      max_price: PRICE_RANGE.MAX,
      author_id: [],
      category_id: [],
      in_stock: null,
      q: '',
      page: 1 // Reset to first page
    };
    
    setFilters(resetFilters);
    
    // Call the parent's onFilterChange with reset filters
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
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
                filters.min_price > PRICE_RANGE.MIN || filters.max_price < PRICE_RANGE.MAX ? 1 : 0,
                filters.author_id.length,
                filters.category_id.length,
                filters.in_stock !== null ? 1 : 0,
                filters.q ? 1 : 0
              ].reduce((a, b) => a + b, 0)} active
            </Typography>
          )}
        </Typography>
        {hasActiveFilters && (
          <Button 
            size="small" 
            onClick={handleClearFilters}
            sx={{ textTransform: 'none' }}
            startIcon={<ClearIcon />}
          >
            Clear all
          </Button>
        )}
      </Box>
      
      {/* Search Section */}
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('search')}>
          <FilterTitle variant="subtitle1">
            Search
            {filters.q && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                1
              </Box>
            )}
          </FilterTitle>
          {expandedSections.search ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.search}>
          <Box sx={{ px: 1, pt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title or author..."
              value={filters.q || ''}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.q && (
                  <InputAdornment position="end">
                    <Button size="small" onClick={handleClearSearch}>
                      <ClearIcon fontSize="small" />
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Collapse>
      </StyledFilterSection>
      
      <Divider sx={{ my: 2 }} />
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('price')}>
          <FilterTitle variant="subtitle1">
            Price Range
            {(filters.min_price > PRICE_RANGE.MIN || filters.max_price < PRICE_RANGE.MAX) && (
              <Box component="span" sx={{ color: 'primary.main', fontSize: '0.75rem', ml: 1 }}>
                (₾{filters.min_price} - ₾{filters.max_price === PRICE_RANGE.MAX ? `${PRICE_RANGE.MAX}+` : filters.max_price})
              </Box>
            )}
          </FilterTitle>
          {expandedSections.price ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.price}>
          <Box sx={{ px: 1, pt: 1 }}>
            <Slider
              value={[filters.min_price, filters.max_price]}
              onChange={handlePriceChange}
              valueLabelDisplay="auto"
              marks={PRICE_RANGE.MARKS}
              min={PRICE_RANGE.MIN}
              max={PRICE_RANGE.MAX}
              step={PRICE_RANGE.STEP}
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
            {filters.author_id.length > 0 && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                {filters.author_id.length}
              </Box>
            )}
          </FilterTitle>
          {expandedSections.authors ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.authors}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Select Authors</InputLabel>
              <Select
                multiple
                value={filters.author_id}
                onChange={handleAuthorChange}
                input={<OutlinedInput label="Select Authors" />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>All Authors</em>;
                  }
                  return selected.map(id => 
                    authors.find(a => a.id === id)?.name || id
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
                {isLoading.authors ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : error.authors ? (
                  <MenuItem disabled>
                    <ListItemText primary={error.authors} />
                  </MenuItem>
                ) : (
                  Array.isArray(authors) && authors.map((author) => (
                    <MenuItem key={author.id} value={author.id}>
                      <Checkbox checked={filters.author_id.indexOf(author.id) > -1} />
                      <ListItemText primary={author.name} />
                    </MenuItem>
                  ))
                )}
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
            {filters.category_id.length > 0 && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                {filters.category_id.length}
              </Box>
            )}
          </FilterTitle>
          {expandedSections.categories ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.categories}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Select Categories</InputLabel>
              <Select
                multiple
                value={filters.category_id}
                onChange={handleCategoryChange}
                input={<OutlinedInput label="Select Categories" />}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>All Categories</em>;
                  }
                  return selected.map(id => 
                    categories.find(c => c.id === id)?.name || id
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
                {isLoading.categories ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : error.categories ? (
                  <MenuItem disabled>
                    <ListItemText primary={error.categories} />
                  </MenuItem>
                ) : (
                  Array.isArray(categories) && categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Checkbox checked={filters.category_id.indexOf(category.id) > -1} />
                      <ListItemText primary={category.name} />
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>
        </Collapse>
      </StyledFilterSection>
      <Divider sx={{ my: 2 }} />
      
      <StyledFilterSection>
        <FilterHeader onClick={() => toggleSection('stockStatus')}>
          <FilterTitle variant="subtitle1">
            Availability
            {filters.in_stock !== null && (
              <Box component="span" sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                fontSize: '0.7rem',
                px: 0.8,
                py: 0.2,
                borderRadius: 10,
                ml: 1
              }}>
                1
              </Box>
            )}
          </FilterTitle>
          {expandedSections.stockStatus ? <ExpandLess /> : <ExpandMore />}
        </FilterHeader>
        <Collapse in={expandedSections.stockStatus}>
          <Box sx={{ px: 1, pt: 1 }}>
            <FormControl fullWidth size="small" variant="outlined">
              <Select
                value={filters.in_stock === true ? 'in_stock' : 'all'}
                onChange={handleStockStatusChange}
                input={<OutlinedInput />}
              >
                <MenuItem value="all">
                  <em>All Books</em>
                </MenuItem>
                {STOCK_STATUS.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
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
