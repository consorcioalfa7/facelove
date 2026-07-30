import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Offline - FaceLove',
  description: 'Você está offline. Verifique sua conexão com a internet.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Offline Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
              <svg
                className="w-16 h-16 text-pink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">!</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-foreground mb-3">
          Você está offline
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Parece que você não está conectado à internet. Verifique sua conexão 
          e tente novamente para continuar lendo suas histórias favoritas.
        </p>

        {/* Tips */}
        <div className="bg-muted/50 rounded-xl p-5 text-left mb-8">
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Dicas
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
              Verifique se o Wi-Fi ou dados móveis estão ativados
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
              Tente recarregar a página quando a conexão for restabelecida
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-1.5 shrink-0" />
              Algumas páginas podem estar disponíveis no cache
            </li>
          </ul>
        </div>

        {/* Retry Button */}
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg hover:shadow-pink-500/25"
        >
          Tentar Novamente
        </button>

        {/* Home Link */}
        <p className="mt-6 text-sm text-muted-foreground">
          Ou{' '}
          <a href="/" className="text-pink-500 hover:text-pink-400 underline">
            voltar para o início
          </a>
        </p>
      </div>
    </div>
  );
}
