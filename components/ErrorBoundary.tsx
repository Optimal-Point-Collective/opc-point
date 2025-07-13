"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    console.error('Error info:', errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0c0c0c] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#121212] rounded-lg p-8 border border-red-800">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#BDB7A9] hover:bg-opacity-90 text-black py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => window.location.href = '/passport/login'}
                className="w-full bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Go to Login
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-xs">
                <summary className="cursor-pointer text-gray-400 hover:text-gray-300">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 p-2 bg-gray-900 rounded text-red-400 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
