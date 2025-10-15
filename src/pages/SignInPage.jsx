// src/pages/SignInPage.jsx
export const SignInPage = ({ 
  authUsername, 
  setAuthUsername,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authConfirmPassword,
  setAuthConfirmPassword,
  isSignUp,
  setIsSignUp,
  setCurrentPage,
  handleSignIn,
  handleSignUp
}) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/images/logo.png" 
            alt="EarthReGen Logo" 
            className="w-20 h-20 object-contain mx-auto mb-4 rounded-xl"
          />
          <h1 className="text-4xl font-bold text-white mb-2">
            <span className="text-green-400">Earth</span>ReGen
          </h1>
          <p className="text-gray-400">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-gray-800 p-8 rounded-xl shadow-2xl">
          <div className="space-y-6">
            {/* Username Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoComplete="username"
                />
                <p className="text-xs text-gray-400 mt-1">At least 3 characters</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleSignIn())}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (isSignUp ? handleSignUp() : handleSignIn())}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              {isSignUp && (
                <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={authConfirmPassword}
                  onChange={(e) => setAuthConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSignUp()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoComplete="new-password"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={isSignUp ? handleSignUp : handleSignIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setAuthUsername('');
                  setAuthEmail('');
                  setAuthPassword('');
                  setAuthConfirmPassword('');
                }}
                className="text-sm text-green-400 hover:text-green-300"
              >
                {isSignUp 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400 mb-3">Or continue as guest</p>
          <button
            onClick={() => setCurrentPage('home')}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Home
          </button>
        </div>

        {/* Info Notice */}
        <div className="mt-6 bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-4">
          <p className="text-sm text-blue-200 text-center">
            <strong>Secure Storage:</strong> Your credentials are stored locally in your browser
          </p>
        </div>
      </div>
    </div>
  );
};