import React, { useState, useEffect } from 'react';
import { CSPRNG } from './lib/crypto';
import { CopyButton } from './shared/CopyButton';
import { Shield, RefreshCw, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [options, setOptions] = useState({
    length: 16,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [strength, setStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);
  const [showPassword, setShowPassword] = useState(true);
  const [entropy, setEntropy] = useState<number>(0);
  const csprng = CSPRNG.getInstance();

  // Enhanced strength calculation that considers entropy
  const calculateStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    // Calculate password entropy
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[^A-Za-z0-9]/.test(password)) charsetSize += 33; // Common symbols

    // Entropy formula: log2(charsetSize) * passwordLength
    const passwordEntropy = Math.log2(charsetSize) * password.length;
    setEntropy(Math.round(passwordEntropy));

    // Strength thresholds based on NIST guidelines
    if (passwordEntropy < 40 || password.length < 8) return 'weak';
    if (passwordEntropy >= 80 && 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password) && 
        /[^A-Za-z0-9]/.test(password)) {
      return 'strong';
    }
    return 'medium';
  };

  const generatePassword = async () => {
    try {
      // Validate that at least one character type is selected
      if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        throw new Error("Please select at least one character type");
      }
      
      setIsLoading(true);
      const password = await csprng.generatePassword(options);
      setResult(password);
      setStrength(calculateStrength(password));
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a password on initial load
  useEffect(() => {
    generatePassword();
  }, []);

  const getStrengthColor = () => {
    switch (strength) {
      case 'weak': return 'text-rose-500 dark:text-rose-400';
      case 'medium': return 'text-amber-500 dark:text-amber-400';
      case 'strong': return 'text-teal-500 dark:text-teal-400';
      default: return '';
    }
  };

  const getStrengthBarWidth = () => {
    switch (strength) {
      case 'weak': return 'w-1/3';
      case 'medium': return 'w-2/3';
      case 'strong': return 'w-full';
      default: return 'w-0';
    }
  };

  const getStrengthBarColor = () => {
    switch (strength) {
      case 'weak': return 'bg-rose-500 dark:bg-rose-400';
      case 'medium': return 'bg-amber-500 dark:bg-amber-400';
      case 'strong': return 'bg-teal-500 dark:bg-teal-400';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Password Generator</h2>
        <div className="ml-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full p-1">
          <Shield size={18} />
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card dark:shadow-card-dark p-6 border border-gray-100 dark:border-gray-700 transition-all">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password Length</label>
            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded-full">
              {options.length} characters
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>8</span>
            <span>36</span>
            <span>64</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <label className="flex items-center p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={options.uppercase}
              onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
              className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Uppercase (A-Z)</span>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={options.lowercase}
              onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
              className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Lowercase (a-z)</span>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={options.numbers}
              onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
              className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Numbers (0-9)</span>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={options.symbols}
              onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
              className="mr-2 h-4 w-4 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Symbols (!@#$%)</span>
          </label>
        </div>
        
        <button
          onClick={generatePassword}
          disabled={isLoading || (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols)}
          className={`w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center ${
            isLoading || (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) 
              ? 'opacity-50 cursor-not-allowed' 
              : ''
          }`}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Password'
          )}
        </button>
        
        {result && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Generated Password</label>
              {strength && (
                <div className={`flex items-center text-sm ${getStrengthColor()}`}>
                  {strength === 'strong' ? <Check size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                  {strength.charAt(0).toUpperCase() + strength.slice(1)}
                  {entropy > 0 && <span className="ml-1 text-xs opacity-75">({entropy} bits)</span>}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                readOnly
                value={result}
                className="w-full p-3 border rounded-lg font-mono pr-20 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700"
              />
              <div className="absolute right-2 top-2 flex space-x-1">
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} className="text-gray-500 dark:text-gray-400" /> : <Eye size={20} className="text-gray-500 dark:text-gray-400" />}
                </button>
                <CopyButton text={result} />
              </div>
            </div>
            
            {/* Password strength bar */}
            {strength && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full ${getStrengthBarWidth()} ${getStrengthBarColor()} transition-all duration-300`}></div>
                </div>
              </div>
            )}
            
            {/* Password tips */}
            {strength === 'weak' && (
              <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-lg text-sm">
                <p className="font-medium mb-1">Weak Password</p>
                <p>Consider using a longer password with a mix of uppercase, lowercase, numbers, and symbols.</p>
              </div>
            )}
            {strength === 'medium' && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm">
                <p className="font-medium mb-1">Medium Strength Password</p>
                <p>Good start! For better security, try increasing the length or adding more character types.</p>
              </div>
            )}
            {strength === 'strong' && (
              <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-lg text-sm">
                <p className="font-medium mb-1">Strong Password</p>
                <p>Excellent! This password provides good security for most applications.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};