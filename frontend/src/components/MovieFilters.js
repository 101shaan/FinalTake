import React, { useState, useEffect } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Range } from 'react-range';
import { getGenres, MOOD_TAGS } from '../utils/movieApi';

const MovieFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [genres, setGenres] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    loadGenres();
  }, []);

  const loadGenres = async () => {
    const genreList = await getGenres();
    setGenres(genreList);
  };

  const handleGenreChange = (selectedGenres) => {
    onFiltersChange({
      ...filters,
      genres: selectedGenres.map(g => g.id)
    });
  };

  const handleMoodChange = (mood) => {
    const newMoods = filters.moods?.includes(mood)
      ? filters.moods.filter(m => m !== mood)
      : [...(filters.moods || []), mood];
    
    onFiltersChange({
      ...filters,
      moods: newMoods
    });
  };

  const handleRatingChange = (rating) => {
    const newRatings = filters.rating?.includes(rating)
      ? filters.rating.filter(r => r !== rating)
      : [...(filters.rating || []), rating];
    
    onFiltersChange({
      ...filters,
      rating: newRatings
    });
  };

  const handleYearChange = (values) => {
    onFiltersChange({
      ...filters,
      year_from: values[0],
      year_to: values[1]
    });
  };

  const selectedGenres = genres.filter(g => filters.genres?.includes(g.id));
  const ageRatings = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300"
        >
          <span>Filters</span>
          <ChevronDownIcon className={`w-5 h-5 transform transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 shadow-2xl border border-gray-800 sticky top-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Filters</h2>
          <button
            onClick={onClearFilters}
            className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-300"
          >
            Clear All
          </button>
        </div>

        <div className="space-y-6">
          {/* Genres Multi-Select */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-3">Genres</label>
            <Listbox value={selectedGenres} onChange={handleGenreChange} multiple>
              <div className="relative">
                <Listbox.Button className="relative w-full bg-gray-800 border border-gray-700 rounded-xl py-3 px-4 text-left text-white focus:outline-none focus:border-yellow-500 transition-colors duration-300">
                  <span className="block truncate">
                    {selectedGenres.length === 0
                      ? 'Select genres...'
                      : `${selectedGenres.length} genre${selectedGenres.length > 1 ? 's' : ''} selected`
                    }
                  </span>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </Listbox.Button>

                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Listbox.Options className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-xl max-h-60 overflow-auto shadow-lg">
                    {genres.map((genre) => (
                      <Listbox.Option
                        key={genre.id}
                        value={genre}
                        className={({ active, selected }) =>
                          `relative cursor-pointer select-none py-3 px-4 ${
                            active ? 'bg-yellow-500/20' : ''
                          } ${selected ? 'bg-yellow-500/30 text-yellow-400' : 'text-white'}`
                        }
                      >
                        {genre.name}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>

          {/* Mood Tags */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-3">Mood Tags</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(MOOD_TAGS).map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodChange(mood)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    filters.moods?.includes(mood)
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Age Rating */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-3">Age Rating</label>
            <div className="flex flex-wrap gap-2">
              {ageRatings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(rating)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    filters.rating?.includes(rating)
                      ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          {/* Year Range Slider */}
          <div>
            <label className="block text-yellow-400 font-semibold mb-3">
              Release Year: {filters.year_from} - {filters.year_to}
            </label>
            <div className="px-2">
              <Range
                step={1}
                min={1970}
                max={2024}
                values={[filters.year_from || 1990, filters.year_to || 2024]}
                onChange={handleYearChange}
                renderTrack={({ props, children }) => (
                  <div
                    {...props}
                    className="h-2 bg-gray-700 rounded-full"
                    style={{
                      background: `linear-gradient(to right, #374151 0%, #eab308 ${
                        ((filters.year_from - 1970) / (2024 - 1970)) * 100
                      }%, #eab308 ${
                        ((filters.year_to - 1970) / (2024 - 1970)) * 100
                      }%, #374151 100%)`
                    }}
                  >
                    {children}
                  </div>
                )}
                renderThumb={({ props }) => (
                  <div
                    {...props}
                    className="h-6 w-6 bg-yellow-500 rounded-full shadow-lg border-2 border-yellow-400 hover:bg-yellow-400 transition-colors duration-300"
                  />
                )}
              />
            </div>
          </div>

          {/* Active Filters Summary */}
          {(selectedGenres.length > 0 || filters.moods?.length > 0 || filters.rating?.length > 0) && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-white font-semibold mb-2">Active Filters:</h3>
              <div className="space-y-2 text-sm">
                {selectedGenres.length > 0 && (
                  <div className="text-gray-300">
                    <span className="text-yellow-400">Genres:</span> {selectedGenres.map(g => g.name).join(', ')}
                  </div>
                )}
                {filters.moods?.length > 0 && (
                  <div className="text-gray-300">
                    <span className="text-yellow-400">Moods:</span> {filters.moods.join(', ')}
                  </div>
                )}
                {filters.rating?.length > 0 && (
                  <div className="text-gray-300">
                    <span className="text-yellow-400">Ratings:</span> {filters.rating.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MovieFilters;