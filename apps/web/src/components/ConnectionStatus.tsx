import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  sessionId?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, sessionId }) => {
  return (
    <div className="flex items-center space-x-2">
      {/* Icono de estado */}
      <div className="flex items-center space-x-1">
        {isConnected ? (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-green-400 font-medium">Conectado</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span className="text-sm text-red-400 font-medium">Sin conexión</span>
          </div>
        )}
      </div>
      
      {/* Información adicional */}
      {isConnected && sessionId && (
        <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-md">
          ID: {sessionId.slice(0, 8)}...
        </div>
      )}
    </div>
  );
};
