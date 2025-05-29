import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MatrixRain from './MatrixRain';
import { generateMovieUsernames, explainUsername } from '../utils/usernameGenerator';
import { useAuth } from '../context/AuthContext';

const LoginPage = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedUsernames, setSuggestedUsernames] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, signup } = useAuth();

  // Generate usernames when switching to signup
  useEffect(() => {
    if (!isLogin) {
      setSuggestedUsernames(generateMovieUsernames());
      setSelectedUsername('');
    }
  }, [isLogin]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const username = isLogin ? formData.username : selectedUsername;
    const { password } = formData;

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!isLogin && !selectedUsername) {
      setError('Please select a username');
      setLoading(false);
      return;
    }

    try {
      const result = isLogin 
        ? await login(username, password)
        : await signup(username, password);

      if (result.success) {
        setSuccess(isLogin ? 'Welcome back!' : 'Account created successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '' });
    setError('');
    setSuccess('');
    setSelectedUsername('');
  };

  const handleUsernameSelect = (username) => {
    setSelectedUsername(username);
  };

  const regenerateUsernames = () => {
    setSuggestedUsernames(generateMovieUsernames());
    setSelectedUsername('');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        {/* Matrix Rain Background */}
        <MatrixRain maskText="FinalTake" />

        {/* Close Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onClose}
          className="absolute top-8 right-8 z-10 p-3 rounded-full bg-black/50 backdrop-blur-sm text-yellow-400 hover:text-yellow-300 hover:bg-black/70 transition-all duration-300"
        >
          <XMarkIcon className="w-6 h-6" />
        </motion.button>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="relative z-10 w-full max-w-md mx-4"
        >
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 border border-yellow-500/30 shadow-2xl shadow-yellow-500/10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
                {isLogin ? 'Welcome Back' : 'Join FinalTake'}
              </h1>
              <p className="text-gray-400">
                {isLogin ? 'Sign in to continue your movie journey' : 'Create your cinematic profile'}
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Selection (Signup) */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <label className="block text-yellow-400 font-semibold">
                    Choose Your Movie Username:
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {suggestedUsernames.map((username, index) => (
                      <motion.button
                        key={username}
                        type="button"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        onClick={() => handleUsernameSelect(username)}
                        className={`p-3 rounded-xl text-left transition-all duration-300 group ${
                          selectedUsername === username
                            ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                            : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-600 hover:border-yellow-500/50'
                        }`}
                        title={explainUsername(username)}
                      >
                        <div className="font-medium text-sm">{username}</div>
                        <div className="text-xs opacity-70 group-hover:opacity-100">
                          {explainUsername(username)}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={regenerateUsernames}
                    className="w-full py-2 text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-300"
                  >
                    🎲 Generate New Options
                  </motion.button>
                </motion.div>
              )}

              {/* Username Input (Login) */}
              {isLogin && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-yellow-400 font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                    placeholder="Enter your username"
                  />
                </motion.div>
              )}

              {/* Password Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="block text-yellow-400 font-semibold mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 pr-12 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-300"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Error/Success Messages */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm text-center"
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl text-green-400 text-sm text-center"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading || (!isLogin && !selectedUsername)}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </motion.button>

              {/* Toggle Mode */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center pt-4"
              >
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-gray-400 hover:text-yellow-400 transition-colors duration-300"
                >
                  {isLogin ? (
                    <>Don't have an account? <span className="text-yellow-400 font-semibold">Sign Up</span></>
                  ) : (
                    <>Already have an account? <span className="text-yellow-400 font-semibold">Sign In</span></>
                  )}
                </button>
              </motion.div>
            </form>
          </div>
        </motion.div>

        {/* Backend Integration Note */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-600 z-10">
          {/* 🔌 Ready for backend integration - replace localStorage with API calls */}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LoginPage;