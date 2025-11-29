import React, { Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-red-100">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto">
                <i className="ri-error-warning-fill text-3xl"></i>
             </div>
             <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">Application Error</h1>
             <p className="text-gray-500 text-center mb-8">
               Something went wrong while rendering the application.
             </p>
             <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-6">
               <code className="text-red-400 text-sm font-mono whitespace-pre-wrap">
                 {this.state.error?.message}
               </code>
             </div>
             <button 
               onClick={() => window.location.reload()}
               className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
             >
               Reload Application
             </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);