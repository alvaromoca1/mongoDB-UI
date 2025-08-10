import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Item = { id: string; name: string; createdAt: number };

export default function ConnectionsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('ExampleDB - Base de Datos de Ejemplo');
  const [uri, setUri] = useState('mongodb://mongo:27017');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const { data } = await api.get<Item[]>('/connections');
      setItems(data);
    } catch (error: any) {
      console.error('Error loading connections:', error);
      setError('Error al cargar las conexiones');
    } finally {
      setLoading(false);
    }
  };

  const create = async () => {
    if (!name.trim() || !uri.trim()) {
      setError('Nombre y URI son requeridos');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.post('/connections', { name, uri });
      await loadConnections();
      setName('Nueva Conexión');
      setUri('mongodb://localhost:27017');
    } catch (error: any) {
      console.error('Error creating connection:', error);
      setError('Error al crear la conexión');
    } finally {
      setLoading(false);
    }
  };

  const open = async (id: string) => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.post<{ sessionId: string }>(`/connect/${id}/open`);
      sessionStorage.setItem('sessionId', data.sessionId);
      window.location.href = '/workbench';
    } catch (error: any) {
      console.error('Error opening connection:', error);
      setError('Error al abrir la conexión. Verifica que MongoDB esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta conexión?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/connections/${id}`);
      setItems((s) => s.filter((i) => i.id !== id));
    } catch (error: any) {
      console.error('Error removing connection:', error);
      setError('Error al eliminar la conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">MongoDB Connection Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/workbench'}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ir al Workbench
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Create Connection Form */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nueva Conexión
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Conexión</label>
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Mi Base de Datos"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">URI de Conexión</label>
              <input 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                value={uri} 
                onChange={(e) => setUri(e.target.value)}
                placeholder="mongodb://localhost:27017"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              La base de datos exampledb se creará automáticamente con datos de ejemplo
            </div>
            <button 
              onClick={create}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Crear Conexión
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Connections List */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 overflow-hidden">
          <div className="p-6 border-b border-gray-200/50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Conexiones ({items.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Cargando conexiones...</p>
            </div>
          ) : items.length > 0 ? (
            <div className="divide-y divide-gray-200/50">
              {items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Creada el {new Date(item.createdAt).toLocaleDateString()} a las {new Date(item.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => open(item.id)}
                        disabled={loading}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-sm"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Abrir
                      </button>
                      <button 
                        onClick={() => remove(item.id)}
                        disabled={loading}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay conexiones</h3>
              <p className="text-gray-500 mb-4">Crea tu primera conexión para comenzar a explorar MongoDB</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


