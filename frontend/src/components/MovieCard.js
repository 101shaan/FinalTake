import React, { useState } from 'react';
import { HeartIcon, BookmarkIcon, PlayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import YouTube from 'react-youtube';
import { getMovieTrailer } from '../utils/movieApi';

const MovieCard = ({ movie, onLike, onDislike, onWatchLater, isLiked, isWatchLater }) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerVideoId, setTrailerVideoId] = useState(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);

  const handleTrailerClick = async () => {
    if (!trailerVideoId) {
      setLoadingTrailer(true);
      const videoId = await getMovieTrailer(movie.title, movie.release_date?.split('-')[0]);
      setTrailerVideoId(videoId);
      setLoadingTrailer(false);
    }
    setShowTrailer(!showTrailer);
  };

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750/1a1a1a/d4af37?text=No+Poster';

  return (
    <div className="group relative bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-yellow-500/20 border border-gray-800 hover:border-yellow-500/50">
      {/* Poster Image */}
      <div className="relative overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-80 object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Trailer Button */}
        <button
          onClick={handleTrailerClick}
          disabled={loadingTrailer}
          className="absolute top-4 right-4 p-3 bg-black/70 hover:bg-yellow-500/90 rounded-full text-white hover:text-black transition-all duration-300 transform hover:scale-110 disabled:opacity-50"
        >
          {loadingTrailer ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>

        {/* Rating Badge */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-yellow-500/90 text-black font-bold rounded-full text-sm">
          ⭐ {movie.vote_average?.toFixed(1)}
        </div>

        {/* Mood Score Badge */}
        {movie.moodScore > 0 && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-purple-500/90 text-white font-semibold rounded-full text-sm">
            Mood: {movie.moodScore}%
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="p-6 space-y-3">
        <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
          {movie.title}
        </h3>
        
        <div className="flex items-center justify-between text-gray-400 text-sm">
          <span>{movie.release_date?.split('-')[0]}</span>
          {movie.director && (
            <span className="text-yellow-400">Dir: {movie.director}</span>
          )}
        </div>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {movie.genres?.slice(0, 3).map((genre) => (
            <span
              key={genre.id}
              className="px-3 py-1 bg-gray-800 text-yellow-400 text-xs rounded-full border border-yellow-500/30"
            >
              {genre.name}
            </span>
          ))}
        </div>

        {/* Overview */}
        <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
          {movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onLike(movie.id)}
              className="p-2 rounded-full hover:bg-red-500/20 transition-colors duration-300 group"
            >
              {isLiked ? (
                <HeartSolid className="w-6 h-6 text-red-500" />
              ) : (
                <HeartIcon className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
              )}
            </button>
            
            <button
              onClick={() => onWatchLater(movie.id)}
              className="p-2 rounded-full hover:bg-yellow-500/20 transition-colors duration-300 group"
            >
              {isWatchLater ? (
                <BookmarkSolid className="w-6 h-6 text-yellow-500" />
              ) : (
                <BookmarkIcon className="w-6 h-6 text-gray-400 group-hover:text-yellow-500" />
              )}
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Runtime: {movie.runtime ? `${movie.runtime}min` : 'N/A'}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div 
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              className="absolute -top-12 right-0 text-white hover:text-yellow-400 text-2xl font-bold"
            >
              ✕
            </button>
            
            {trailerVideoId ? (
              <YouTube
                videoId={trailerVideoId}
                opts={{
                  width: '100%',
                  height: '500',
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                  },
                }}
                className="w-full rounded-lg overflow-hidden"
              />
            ) : (
              <div className="bg-gray-900 rounded-lg p-8 text-center">
                <h3 className="text-white text-xl mb-4">Trailer Not Available</h3>
                <p className="text-gray-400">Sorry, we couldn't find a trailer for this movie.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;