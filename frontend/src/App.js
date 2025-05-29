import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import MovieFilters from './components/MovieFilters';
import MovieCard from './components/MovieCard';
import LoginPage from './components/LoginPage';
import { getMovies, getSimilarMovies, encodeFiltersToURL, decodeFiltersFromURL } from './utils/movieApi';
import { MagnifyingGlassIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { AuthProvider, useAuth, useRequireAuth } from './context/AuthContext';
import './App.css';

const STORAGE_KEYS = {
  LIKED_MOVIES: 'finaltake_liked_movies',
  WATCH_LATER: 'finaltake_watch_later',
  DARK_MODE: 'finaltake_dark_mode'
};

function MovieApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedMovies, setLikedMovies] = useState(new Set());
  const [watchLaterMovies, setWatchLaterMovies] = useState(new Set());
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const { user, updateUserData } = useAuth();
  const { requireAuth, showAuthPrompt, setShowAuthPrompt } = useRequireAuth();
  
  const [filters, setFilters] = useState({
    genres: [],
    moods: [],
    rating: [],
    year_from: 1990,
    year_to: 2024
  });

  // Initialize from localStorage and URL params
  useEffect(() => {
    // Load saved preferences from user data or localStorage
    if (user) {
      setLikedMovies(new Set(user.likedMovies || []));
      setWatchLaterMovies(new Set(user.watchLater || []));
    } else {
      // Fallback to localStorage for non-logged-in users
      const savedLiked = localStorage.getItem(STORAGE_KEYS.LIKED_MOVIES);
      const savedWatchLater = localStorage.getItem(STORAGE_KEYS.WATCH_LATER);
      const savedDarkMode = localStorage.getItem(STORAGE_KEYS.DARK_MODE);

      if (savedLiked) setLikedMovies(new Set(JSON.parse(savedLiked)));
      if (savedWatchLater) setWatchLaterMovies(new Set(JSON.parse(savedWatchLater)));
      if (savedDarkMode !== null) setDarkMode(JSON.parse(savedDarkMode));
    }

    // Load filters from URL
    const urlFilters = decodeFiltersFromURL(searchParams);
    setFilters(urlFilters);
  }, [searchParams, user]);

  // Load movies when filters change
  useEffect(() => {
    loadMovies();
  }, [filters]);

  // Update URL when filters change
  useEffect(() => {
    const encoded = encodeFiltersToURL(filters);
    if (encoded !== searchParams.toString()) {
      setSearchParams(encoded);
    }
  }, [filters]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const movieData = await getMovies(filters);
      setMovies(movieData.results || []);
      
      // Load recommendations based on first movie
      if (movieData.results?.length > 0) {
        const similar = await getSimilarMovies(movieData.results[0].id);
        setRecommendedMovies(similar);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      genres: [],
      moods: [],
      rating: [],
      year_from: 1990,
      year_to: 2024
    });
  };

  const handleLike = (movieId) => {
    requireAuth(() => {
      const newLiked = new Set(likedMovies);
      if (newLiked.has(movieId)) {
        newLiked.delete(movieId);
      } else {
        newLiked.add(movieId);
      }
      setLikedMovies(newLiked);
      
      // Update user data if logged in
      if (user) {
        updateUserData({ likedMovies: [...newLiked] });
      } else {
        localStorage.setItem(STORAGE_KEYS.LIKED_MOVIES, JSON.stringify([...newLiked]));
      }
    });
  };

  const handleWatchLater = (movieId) => {
    requireAuth(() => {
      const newWatchLater = new Set(watchLaterMovies);
      if (newWatchLater.has(movieId)) {
        newWatchLater.delete(movieId);
      } else {
        newWatchLater.add(movieId);
      }
      setWatchLaterMovies(newWatchLater);
      
      // Update user data if logged in
      if (user) {
        updateUserData({ watchLater: [...newWatchLater] });
      } else {
        localStorage.setItem(STORAGE_KEYS.WATCH_LATER, JSON.stringify([...newWatchLater]));
      }
    });
  };

  const SkeletonCard = () => (
    <div className="bg-gray-900 rounded-2xl overflow-hidden animate-pulse">
      <div className="h-80 bg-gray-800"></div>
      <div className="p-6 space-y-3">
        <div className="h-6 bg-gray-800 rounded w-3/4"></div>
        <div className="h-4 bg-gray-800 rounded w-1/2"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-800 rounded w-16"></div>
          <div className="h-6 bg-gray-800 rounded w-20"></div>
        </div>
        <div className="h-16 bg-gray-800 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-500 bg-black">
      {/* Login Modal */}
      <LoginPage isOpen={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-black via-gray-900 to-black border-b border-yellow-500/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                🎬 FinalTake
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && (
                <span className="text-yellow-400 text-sm">
                  Welcome, {user.username}!
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <MovieFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Movies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {loading ? (
                // Skeleton Loading
                Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onLike={handleLike}
                    onWatchLater={handleWatchLater}
                    isLiked={likedMovies.has(movie.id)}
                    isWatchLater={watchLaterMovies.has(movie.id)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <MagnifyingGlassIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-400 mb-2">No movies found</h3>
                  <p className="text-gray-500">Try adjusting your filters to discover more movies</p>
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            {showRecommendations && recommendedMovies.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="text-yellow-400 mr-3">✨</span>
                  Recommended for You
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
                  {recommendedMovies.map((movie) => (
                    <MovieCard
                      key={`rec-${movie.id}`}
                      movie={movie}
                      onLike={handleLike}
                      onWatchLater={handleWatchLater}
                      isLiked={likedMovies.has(movie.id)}
                      isWatchLater={watchLaterMovies.has(movie.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Watch Later Summary */}
            {watchLaterMovies.size > 0 && (
              <div className="mt-16 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">
                  📋 Your Watch Later List
                </h3>
                <p className="text-gray-300">
                  You have {watchLaterMovies.size} movie{watchLaterMovies.size !== 1 ? 's' : ''} saved to watch later.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-black via-gray-900 to-black border-t border-yellow-500/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              Made with ❤️ for movie lovers • Share your filters with friends using the URL
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MovieApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;