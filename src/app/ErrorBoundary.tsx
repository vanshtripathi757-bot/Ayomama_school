import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'An unexpected rendering error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[The School Chronicles] ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080c17] px-6 text-center text-slate-100">
          <div className="max-w-md rounded-lg bg-[#0e1526] border border-rose-500/40 p-6 shadow-2xl">
            <div className="text-xs font-semibold tracking-widest text-rose-400 uppercase mb-1">
              APPLICATION RECOVERY
            </div>
            <h1 className="font-display text-xl font-semibold text-white mb-2">
              Unable to Render Scene
            </h1>
            <p className="text-xs text-slate-300 mb-5">{this.state.errorMessage}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="min-h-[42px] px-5 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors cursor-pointer"
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
