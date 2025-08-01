import {useEffect, useState} from "react";
import Nav from "../components/Nav.jsx";
import Card from "../components/Card";
import FilterBar from "../components/FilterBar";
import {getBooks} from "../services/bookService";
import {TextField, InputAdornment, IconButton, Snackbar, Alert} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useCart } from "../hooks/useCart";

export default function Home() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const navLinks = [
        {label: "Home", to: "/"}, 
        {label: "Books", to: "/books"}, 
        {label: "Orders", to: "/orders"}, 
        {label: "Profile", to: "/profile"}
    ];

    const showSnackbar = (message, severity = 'success') => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const data = await getBooks();
                setBooks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, []);

    if (loading) {
        return (<div className="min-h-screen bg-gray-50">
                <Nav links={navLinks}/>
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <div
                            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading books...</p>
                    </div>
                </div>
            </div>);
    }

    if (error) {
        return (<div className="min-h-screen bg-gray-50">
                <Nav links={navLinks}/>
                <div className="container mx-auto px-4 py-8">
                    <div
                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                        role="alert"
                    >
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                </div>
            </div>);
    }

    const handleFilterChange = (filters) => {
        console.log("Filters changed:", filters);
        // TODO: Implement filtering logic based on the filters
    };

    const handleAddToCart = async (book) => {
        try {
            await addToCart(book.id, 1);
            showSnackbar(`${book.title} added to cart!`, 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showSnackbar(error.message || 'Failed to add item to cart', 'error');
        }
    };

    return (<div className="min-h-screen bg-gray-50">
            <Nav links={navLinks}/>
            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex flex-col lg:flex-row gap-4 lg:gap-8">
                {/* Sidebar with filters - hidden on mobile, shown on larger screens */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <FilterBar onFilterChange={handleFilterChange}/>
                </div>

                {/* Main content */}
                <div className="flex-1 max-w-7xl mx-auto w-full">
                    {/* Search bar */}
                    <div className="px-4 sm:px-0 mb-6 w-5/6 lg:mx-9">
                        <TextField
                            className="w-full"
                            id="outlined-search"
                            label="Search books..."
                            type="search"
                            variant="outlined"
                            size="small"
                            InputProps={{
                                endAdornment: (<InputAdornment position="end">
                                        <IconButton
                                            type="submit"
                                            aria-label="search"
                                            edge="end"
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <SearchIcon/>
                                        </IconButton>
                                    </InputAdornment>),
                            }}
                        />
                    </div>

                    {/* Header with results count */}
                    <div className="px-4 sm:px-2 mb-4 sm:mb-6 w-5/6 lg:mx-9">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">Featured Books</h1>
                            <div className="text-sm text-gray-500">
                                {books.length} {books.length === 1 ? "book" : "books"} available
                            </div>
                        </div>
                    </div>

                    {/* Books grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-2">
                        {books.map((book) => (
                            <div key={book.id} className="flex justify-center w-full h-full">
                                <Card
                                    title={book.title}
                                    author={book.author}
                                    price={book.price || 0}
                                    imageUrl={book.cover_url}
                                    to={`/books/${book.id}`}
                                    className="w-full max-w-[180px] sm:max-w-[200px] md:max-w-[220px] h-full transition-transform duration-200 hover:scale-105"
                                    onAddToCart={() => handleAddToCart(book)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Snackbar for notifications */}
            <Snackbar 
                open={snackbarOpen} 
                autoHideDuration={3000} 
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={handleSnackbarClose} 
                    severity={snackbarSeverity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    );
}
