import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { ConnectionStatus } from '../components/ConnectionStatus';

type DbInfo = { name: string; sizeOnDisk?: number; empty?: boolean };
type CollectionInfo = { name: string; type?: string; options?: any };

export default function WorkbenchPage() {
  const { isDark } = useTheme();
  const [databases, setDatabases] = useState<DbInfo[]>([]);
  const [db, setDb] = useState<string>('');
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [coll, setColl] = useState<string>('');
  const [query, setQuery] = useState<string>('{}');
  const [limit, setLimit] = useState<number>(50);
  const [loading, setLoading] = useState<boolean>(false);
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [showQueryHelp, setShowQueryHelp] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const sessionId = sessionStorage.getItem('sessionId');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (sessionId) {
      setIsConnected(true);
      loadDatabases();
    } else {
      setIsConnected(false);
    }
  }, [sessionId]);

  const loadDatabases = async () => {
    if (!sessionId) {
      alert('No hay sesión activa. Por favor, abre una conexión primero.');
      window.location.href = '/connections';
      return;
    }
    try {
      setLoading(true);
      console.log('Cargando bases de datos con sessionId:', sessionId);
      const { data } = await api.get(`/${sessionId}/databases`);
      setDatabases(data);
    } catch (error: any) {
      console.error('Error al cargar bases de datos:', error);
      if (error.response?.status === 404) {
        alert('La sesión ha expirado. Por favor, abre una conexión nuevamente.');
        sessionStorage.removeItem('sessionId');
        window.location.href = '/connections';
      } else {
        alert('Error al cargar las bases de datos');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async (dbname: string) => {
    if (!sessionId) return;
    setDb(dbname);
    setColl('');
    setDocs([]);
    try {
      setLoading(true);
      const { data } = await api.get(`/${sessionId}/databases/${dbname}/collections`);
      setCollections(data);
    } catch (error: any) {
      console.error('Error al cargar colecciones:', error);
      alert('Error al cargar las colecciones');
    } finally {
      setLoading(false);
    }
  };

  const loadDocs = async (collName?: string) => {
    if (!sessionId || !db) return;
    const collectionName = collName || coll;
    if (!collectionName) return;
    
    setColl(collectionName);
    try {
      setLoading(true);
      let filter = {};
      try {
        filter = JSON.parse(query);
      } catch (e) {
        alert('Query inválido. Debe ser un JSON válido.');
        return;
      }
      
      const { data } = await api.post(`/${sessionId}/find`, { 
        db, 
        coll: collectionName, 
        filter,
        limit: Math.min(limit, 1000)
      });
      setDocs(data.docs);
    } catch (error: any) {
      console.error('Error al cargar documentos:', error);
      alert('Error al cargar los documentos');
    } finally {
      setLoading(false);
    }
  };

  const createCollection = async () => {
    if (!sessionId || !db || !newCollectionName.trim()) return;
    try {
      setLoading(true);
      // Crear una colección vacía insertando un documento y luego eliminándolo
      await api.post(`/${sessionId}/insertOne`, {
        db,
        coll: newCollectionName,
        doc: { _temp: true }
      });
      
      // Eliminar el documento temporal
      await api.post(`/${sessionId}/deleteOne`, {
        db,
        coll: newCollectionName,
        filter: { _temp: true }
      });
      
      setNewCollectionName('');
      await loadCollections(db);
      alert('Colección creada exitosamente');
    } catch (error: any) {
      console.error('Error al crear colección:', error);
      alert('Error al crear la colección');
    } finally {
      setLoading(false);
    }
  };

  const queryExamples = [
    { name: 'Todos los documentos', query: '{}' },
    { name: 'Por campo específico', query: '{"name": "valor"}' },
    { name: 'Operadores de comparación', query: '{"age": {"$gt": 18}}' },
    { name: 'Operador OR', query: '{"$or": [{"status": "active"}, {"status": "pending"}]}' },
    { name: 'Búsqueda de texto', query: '{"$text": {"$search": "palabra"}}' },
    { name: 'Por fecha', query: '{"createdAt": {"$gte": {"$date": "2024-01-01"}}}' },
    { name: 'Campos anidados', query: '{"address.city": "Madrid"}' },
    { name: 'Array contiene', query: '{"tags": {"$in": ["tag1", "tag2"]}}' }
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gradient-to-br from-[#34495e] via-[#2c3e50] to-[#243342]' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      {/* Header */}
              <header className={`${isDark ? 'bg-[#2c3e50]/80' : 'bg-white/80'} backdrop-blur-sm border-b ${isDark ? 'border-gray-600' : 'border-gray-200'} shadow-lg sticky top-0 z-10`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>MongoDB Workbench</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectionStatus isConnected={isConnected} sessionId={sessionId || undefined} />
              <ThemeToggle />
              <button 
                onClick={() => window.location.href = '/connections'}
                className="text-sm text-white hover:text-blue-200 font-medium px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm border border-white/30 transition-all duration-200"
              >
                Cambiar conexión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className={`w-80 ${isDark ? 'bg-[#2c3e50]/70' : 'bg-white/70'} backdrop-blur-sm border-r ${isDark ? 'border-gray-600' : 'border-gray-200/50'} overflow-hidden`}>
          <div className="h-full flex flex-col">
            {/* Databases Section */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <h2 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  Bases de datos
                </h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
                    <span className={`ml-2 ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Cargando...</span>
                  </div>
                ) : databases.length > 0 ? (
                  <div className="space-y-2">
                    {databases.map((d) => (
                      <button 
                        key={d.name}
                        onClick={() => loadCollections(d.name)}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                          db === d.name 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border border-blue-400/30' 
                            : `${isDark ? 'bg-[#34495e]/50 hover:bg-[#34495e]/70 text-white hover:shadow-md' : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'}`
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium truncate">{d.name}</div>
                          {db === d.name && (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {d.sizeOnDisk && (
                          <div className={`text-xs mt-1 ${
                            db === d.name ? 'text-blue-100' : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {(d.sizeOnDisk / 1024 / 1024).toFixed(2)} MB
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No hay bases de datos disponibles</p>
                  </div>
                )}
              </div>

              {/* Collections Section */}
              {db && (
                <div className={`border-t pt-6 ${isDark ? 'border-gray-600' : 'border-gray-200/50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <svg className={`w-5 h-5 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Colecciones
                    </h3>
                    <button 
                      onClick={() => setNewCollectionName('nueva_coleccion')}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-sm"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Nueva
                    </button>
                  </div>
                  
                  {/* Create Collection Form */}
                  {newCollectionName && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
                      <input
                        type="text"
                        value={newCollectionName}
                        onChange={(e) => setNewCollectionName(e.target.value)}
                        placeholder="Nombre de la colección"
                        className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                      <div className="flex gap-2 mt-3">
                        <button 
                          onClick={createCollection}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Crear
                        </button>
                        <button 
                          onClick={() => setNewCollectionName('')}
                          className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {collections.length > 0 ? (
                    <div className="space-y-2">
                      {collections.map((c) => (
                        <button 
                          key={c.name}
                          onClick={() => loadDocs(c.name)}
                          className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                            coll === c.name 
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border border-green-400/30' 
                              : `${isDark ? 'bg-[#34495e]/50 hover:bg-[#34495e]/70 text-white hover:shadow-md' : 'bg-white/50 hover:bg-white/80 text-gray-700 hover:shadow-md'}`
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium truncate">{c.name}</div>
                            {coll === c.name && (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          {c.type && (
                            <div className={`text-xs mt-1 ${
                              coll === c.name ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {c.type}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm mb-3">No hay colecciones en esta base de datos</p>
                      <button 
                        onClick={() => setNewCollectionName('nueva_coleccion')}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Crear primera colección
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {db && coll ? (
            <div className="h-full flex flex-col">
              {/* Content Header */}
              <div className={`${isDark ? 'bg-[#2c3e50]/70' : 'bg-white/70'} backdrop-blur-sm border-b ${isDark ? 'border-gray-600' : 'border-gray-200/50'} p-6`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{db}.{coll}</h2>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{docs.length} documentos encontrados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Builder */}
              <div className={`${isDark ? 'bg-[#2c3e50]/70' : 'bg-white/70'} backdrop-blur-sm border-b ${isDark ? 'border-gray-600' : 'border-gray-200/50'} p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Query Builder
                  </h3>
                  <button 
                    onClick={() => setShowQueryHelp(!showQueryHelp)}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showQueryHelp ? 'Ocultar' : 'Mostrar'} ayuda
                  </button>
                </div>

                {/* Query Help */}
                {showQueryHelp && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200/50">
                    <h4 className="font-medium mb-3 text-purple-900">Ejemplos de queries:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {queryExamples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(example.query)}
                          className="text-left p-3 bg-white rounded-lg border border-purple-200 hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                        >
                          <div className="font-medium text-purple-900 text-sm">{example.name}</div>
                          <div className="text-purple-600 font-mono text-xs mt-1">{example.query}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Query (JSON)</label>
                    <textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={`w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                        isDark 
                          ? 'bg-[#2c3e50] border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      rows={3}
                      placeholder='{"field": "value"}'
                    />
                  </div>
                  <div className="w-32">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>Límite</label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark 
                          ? 'bg-[#2c3e50] border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={() => loadDocs()}
                  disabled={loading}
                  className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-sm"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ejecutar Query
                    </>
                  )}
                </button>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-hidden">
                <div className={`h-full ${isDark ? 'bg-[#2c3e50]/70' : 'bg-white/70'} backdrop-blur-sm rounded-t-xl overflow-hidden`}>
                  <div className={`p-4 border-b ${isDark ? 'border-gray-600 bg-[#2c3e50]/50' : 'border-gray-200/50 bg-white/50'}`}>
                    <h3 className={`font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Resultados
                    </h3>
                  </div>
                  
                  <div className="h-full overflow-auto">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
                          <p className={isDark ? 'text-gray-300' : 'text-gray-500'}>Cargando documentos...</p>
                        </div>
                      </div>
                    ) : docs.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className={`min-w-full divide-y ${isDark ? 'divide-gray-600' : 'divide-gray-200'}`}>
                          <thead className={isDark ? 'bg-[#34495e]/50' : 'bg-gray-50/50'}>
                            <tr>
                              <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>#</th>
                              {Object.keys(docs[0]).slice(0, 10).map(key => (
                                <th key={key} className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                                  {key}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className={`${isDark ? 'bg-[#2c3e50] divide-gray-600' : 'bg-white divide-gray-200'}`}>
                            {docs.map((doc, i) => (
                              <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-[#34495e]/50' : 'hover:bg-gray-50/50'}`}>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>{i + 1}</td>
                                {Object.keys(docs[0]).slice(0, 10).map(key => (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm">
                                    {typeof doc[key] === 'object' ? (
                                      <span className={`font-mono text-xs px-2 py-1 rounded ${
                                        isDark 
                                          ? 'text-gray-300 bg-[#34495e]' 
                                          : 'text-gray-600 bg-gray-100'
                                      }`}>
                                        {JSON.stringify(doc[key]).substring(0, 50)}
                                        {JSON.stringify(doc[key]).length > 50 ? '...' : ''}
                                      </span>
                                    ) : (
                                      <span className={isDark ? 'text-white' : 'text-gray-900'}>{String(doc[key])}</span>
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-[#34495e]' : 'bg-gray-100'}`}>
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-500'}`}>No se encontraron documentos</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Intenta con un query diferente</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  isDark 
                    ? 'bg-gradient-to-r from-[#34495e] to-[#2c3e50]' 
                    : 'bg-gradient-to-r from-blue-100 to-indigo-100'
                }`}>
                  <svg className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Bienvenido al MongoDB Workbench</h2>
                <p className={`mb-6 max-w-md mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Selecciona una base de datos y colección para comenzar a explorar tus datos de MongoDB
                </p>
                <div className={`flex items-center justify-center space-x-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    Explorar bases de datos
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Gestionar colecciones
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    Ejecutar queries
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}


