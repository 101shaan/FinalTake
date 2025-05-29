// Movie-themed username generator
const moviePrefixes = [
  // Directors
  'Kubrick', 'Tarantino', 'Hitchcock', 'Scorsese', 'Nolan', 'Spielberg', 'Coppola', 'Lynch', 'Fincher', 'Anderson',
  'Cameron', 'Burton', 'Ridley', 'Lucas', 'Eastwood', 'Allen', 'Brooks', 'Zemeckis', 'Jackson', 'Raimi',
  
  // Iconic Characters & Films
  'Matrix', 'Blade', 'Neo', 'Trinity', 'Morpheus', 'Vader', 'Solo', 'Leia', 'Skywalker', 'Obi',
  'Joker', 'Batman', 'Bond', 'Ethan', 'Rocky', 'Luke', 'Hans', 'Sarah', 'Ellen', 'Rick',
  'Gandalf', 'Frodo', 'Aragorn', 'Legolas', 'Gimli', 'Boromir', 'Galadriel', 'Elrond', 'Saruman', 'Sauron',
  
  // Classic Films
  'Casablanca', 'Citizen', 'Vertigo', 'Psycho', 'Sunset', 'Singin', 'Gone', 'Lawrence', 'Godfather', 'Goodfellas',
  'Pulp', 'Shawshank', 'Schindler', 'Forrest', 'Titanic', 'Avatar', 'Inception', 'Interstellar', 'Gladiator', 'Braveheart',
  
  // Genres & Styles
  'Noir', 'Western', 'Thriller', 'Comedy', 'Drama', 'Action', 'Sci', 'Horror', 'Romance', 'Mystery',
  'Epic', 'Classic', 'Modern', 'Vintage', 'Silver', 'Golden', 'Midnight', 'Crimson', 'Neon', 'Chrome',
  
  // Movie Studios & Terms
  'Metro', 'Warner', 'Universal', 'Paramount', 'Disney', 'Sony', 'Fox', 'Columbia', 'Miramax', 'Studio',
  'Cinema', 'Film', 'Movie', 'Picture', 'Motion', 'Screen', 'Reel', 'Frame', 'Scene', 'Shot'
];

const movieSuffixes = [
  // Film Industry Terms
  'Frame', 'Scene', 'Take', 'Cut', 'Shot', 'Reel', 'Edit', 'Vault', 'Studio', 'Lens',
  'Focus', 'Zoom', 'Pan', 'Tilt', 'Dolly', 'Crane', 'Boom', 'Grip', 'Gaffer', 'Key',
  
  // Production Terms
  'Producer', 'Director', 'Writer', 'Editor', 'Composer', 'Designer', 'Critic', 'Fan', 'Buff', 'Lover',
  'Watcher', 'Viewer', 'Observer', 'Seeker', 'Hunter', 'Finder', 'Collector', 'Curator', 'Guide', 'Expert',
  
  // Technical Terms
  'Angle', 'Close', 'Wide', 'Medium', 'Master', 'Insert', 'Cutaway', 'Montage', 'Sequence', 'Transition',
  'Fade', 'Dissolve', 'Wipe', 'Cross', 'Match', 'Jump', 'Flash', 'Freeze', 'Slow', 'Fast',
  
  // Creative Terms
  'Vision', 'Style', 'Mood', 'Tone', 'Theme', 'Motif', 'Symbol', 'Arc', 'Beat', 'Moment',
  'Peak', 'Climax', 'Twist', 'Turn', 'Reveal', 'Surprise', 'Shock', 'Thrill', 'Rush', 'High'
];

/**
 * Generates 4 unique movie-themed usernames
 * Format: [MoviePrefix][FilmSuffix][2DigitNumber]
 * @returns {Array<string>} Array of 4 unique usernames
 */
export const generateMovieUsernames = () => {
  const usernames = new Set();
  
  while (usernames.size < 4) {
    const prefix = moviePrefixes[Math.floor(Math.random() * moviePrefixes.length)];
    const suffix = movieSuffixes[Math.floor(Math.random() * movieSuffixes.length)];
    const number = Math.floor(Math.random() * 90) + 10; // 10-99
    
    const username = `${prefix}${suffix}${number}`;
    usernames.add(username);
  }
  
  return Array.from(usernames);
};

/**
 * Get explanation for username components (for tooltips/hints)
 * @param {string} username - The generated username
 * @returns {string} Explanation of the username
 */
export const explainUsername = (username) => {
  // Extract components (this is a simplified version)
  const match = username.match(/^([A-Za-z]+)([A-Za-z]+)(\d+)$/);
  if (!match) return "Movie-inspired username";
  
  const [, prefix, suffix] = match;
  
  // Simple explanation based on common patterns
  if (moviePrefixes.includes(prefix)) {
    if (['Frame', 'Scene', 'Take', 'Cut', 'Shot'].includes(suffix)) {
      return `Film reference + Production term`;
    } else if (['Critic', 'Fan', 'Buff', 'Lover'].includes(suffix)) {
      return `Movie reference + Cinema enthusiast`;
    } else {
      return `Cinema-inspired + Film industry term`;
    }
  }
  
  return "Movie-themed username";
};

export default generateMovieUsernames;