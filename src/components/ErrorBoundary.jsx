import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createErrorReport } from '@/data/errorReports';

/**
 * ErrorBoundary - Capture les erreurs React non gérées
 * Envoie automatiquement un rapport d'erreur à Supabase
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log l'erreur
    console.error('❌ ErrorBoundary caught:', error, errorInfo);

    // Sauvegarder l'erreur dans le state
    this.setState({
      error,
      errorInfo,
    });

    // Limiter les rapports d'erreur pour éviter les boucles (max 1 toutes les 5 secondes)
    const now = Date.now();
    const lastReportTime = window._lastErrorReportTime || 0;
    const timeSinceLastReport = now - lastReportTime;

    if (timeSinceLastReport < 5000) {
      console.warn('⚠️ Rate limiting error reports, skipping this one');
      return;
    }

    window._lastErrorReportTime = now;

    // Envoyer le rapport d'erreur à Supabase
    try {
      createErrorReport({
        error_type: 'React Error',
        error_message: error.toString(),
        stack_trace: errorInfo.componentStack,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
        report_date: new Date().toISOString(),
      }).catch((err) => {
        console.error("Impossible d'envoyer le rapport d'erreur:", err);
      });
    } catch (err) {
      console.error('Erreur lors de la création du rapport:', err);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full shadow-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Oups ! Une erreur est survenue
              </CardTitle>
              <CardDescription className="text-base mt-2">
                L'application a rencontré un problème inattendu. Un rapport d'erreur a été
                automatiquement envoyé à notre équipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {import.meta.env.DEV && this.state.error && (
                <div className="bg-slate-100 border border-slate-300 rounded-lg p-4">
                  <p className="text-sm font-mono text-red-800 mb-2">
                    <strong>Erreur:</strong> {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-xs font-mono text-slate-700 mt-2">
                      <summary className="cursor-pointer font-semibold text-slate-900">
                        Stack trace
                      </summary>
                      <pre className="mt-2 overflow-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Recharger la page
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1" size="lg">
                  <Home className="mr-2 h-5 w-5" />
                  Retour à l'accueil
                </Button>
              </div>

              <div className="text-center text-sm text-slate-600">
                <p>Si le problème persiste, veuillez contacter le support.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
