import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AutoFlux Core System Bug Catch:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.onReset) this.onReset();
    window.location.reload();
  };

  private onReset = this.props.onReset;

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full glass-card p-10 rounded-[3rem] border-red-500/20 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
              AutoFlux<span className="text-red-500">.io</span>
            </h1>
            
            <div className="space-y-2">
              <h2 className="text-red-400 font-bold uppercase tracking-widest text-xs">Fallo de Sistema Detectado</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                {this.state.error?.message || "Error inesperado al cargar la interfaz. Verifica la conexión de datos."}
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={this.handleReset}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                <RefreshCcw className="w-4 h-4" />
                Reiniciar Sistema
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
              >
                <Home className="w-4 h-4" />
                Retornar al Inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
