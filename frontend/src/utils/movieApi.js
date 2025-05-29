const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const OMDB_BASE_URL = 'https://www.omdbapi.com';

// Mood tags mapping for scoring
const MOOD_TAGS = {
  'Feel-Good': ['comedy', 'family', 'romance', 'music'],
  'Mind-Bending': ['thriller', 'science fiction', 'mystery'],
  'Dark': ['horror', 'crime', 'war'],
  'Action-Packed': ['action', 'adventure'],
  'Emotional': ['drama', 'romance'],
  'Epic': ['fantasy', 'adventure', 'history']
};

// Get popular movies with filters
export const getMovies = async (filters = {}) => {
  try {
    const {
      genres = [],
      year_from = 1990,
      year_to = 2024,
      rating = [],
      page = 1
    } = filters;

    let url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&page=${page}&primary_release_date.gte=${year_from}-01-01&primary_release_date.lte=${year_to}-12-31&sort_by=popularity.desc`;

    if (genres.length > 0) {
      url += `&with_genres=${genres.join(',')}`;
    }

    if (rating.length > 0) {
      const certifications = rating.join('|');
      url += `&certification_country=US&certification=${certifications}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    // Enhance movies with additional data
    const enhancedMovies = await Promise.all(
      data.results.slice(0, 20).map(async (movie) => {
        const movieDetails = await getMovieDetails(movie.id);
        const director = await getDirectorFromOMDB(movie.title, movie.release_date?.split('-')[0]);
        
        return {
          ...movie,
          ...movieDetails,
          director,
          moodScore: calculateMoodScore(movieDetails.genres || [], filters.moods || [])
        };
      })
    );

    return {
      ...data,
      results: enhancedMovies
    };
  } catch (error) {
    console.error('Error fetching movies:', error);
    return { results: [] };
  }
};

// Get movie details from TMDB
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=videos`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return {};
  }
};

// Get director from OMDb API
export const getDirectorFromOMDB = async (title, year) => {
  try {
    const response = await fetch(`${OMDB_BASE_URL}/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}&y=${year}`);
    const data = await response.json();
    return data.Director && data.Director !== 'N/A' ? data.Director : null;
  } catch (error) {
    console.error('Error fetching director from OMDb:', error);
    return null;
  }
};

// Get movie trailer from YouTube
export const getMovieTrailer = async (title, year) => {
  try {
    const query = `${title} ${year} official trailer`;
    const response = await fetch(`${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${YOUTUBE_API_KEY}&maxResults=1`);
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching trailer:', error);
    return null;
  }
};

// Get genres from TMDB
export const getGenres = async () => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.genres || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

// Get similar movies
export const getSimilarMovies = async (movieId) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`);
    const data = await response.json();
    return data.results?.slice(0, 5) || [];
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    return [];
  }
};

// Calculate mood score based on selected moods and movie genres
const calculateMoodScore = (movieGenres, selectedMoods) => {
  if (!selectedMoods || selectedMoods.length === 0) return 0;
  
  let score = 0;
  const genreNames = movieGenres.map(g => g.name?.toLowerCase());
  
  selectedMoods.forEach(mood => {
    const moodGenres = MOOD_TAGS[mood] || [];
    const matches = moodGenres.filter(genre => 
      genreNames.some(movieGenre => movieGenre.includes(genre))
    );
    score += matches.length * 20; // 20 points per genre match
  });
  
  return Math.min(score, 100); // Cap at 100
};

// Encode filters to URL
export const encodeFiltersToURL = (filters) => {
  const params = new URLSearchParams();
  
  if (filters.genres?.length) params.set('genres', filters.genres.join(','));
  if (filters.moods?.length) params.set('moods', filters.moods.join(','));
  if (filters.rating?.length) params.set('rating', filters.rating.join(','));
  if (filters.year_from) params.set('year_from', filters.year_from);
  if (filters.year_to) params.set('year_to', filters.year_to);
  
  return params.toString();
};

// Decode filters from URL
export const decodeFiltersFromURL = (searchParams) => {
  return {
    genres: searchParams.get('genres')?.split(',').filter(Boolean) || [],
    moods: searchParams.get('moods')?.split(',').filter(Boolean) || [],
    rating: searchParams.get('rating')?.split(',').filter(Boolean) || [],
    year_from: parseInt(searchParams.get('year_from')) || 1990,
    year_to: parseInt(searchParams.get('year_to')) || 2024
  };
};

export { MOOD_TAGS };