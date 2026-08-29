/**
 * CDC Excalidraw - Auto-load Corporate & Architecture Libraries
 * Injeta bibliotecas padrão (.excalidrawlib) no IndexedDB e LocalStorage do usuário de forma idempotente.
 */
(async function initExcalidrawLibraries() {
  const BUNDLE_VERSION = 'v1.0.0';
  const VERSION_KEY = 'cdc-excalidraw-libraries-version';

  // Se já foi inicializado nesta versão, não refaz o fetch
  if (localStorage.getItem(VERSION_KEY) === BUNDLE_VERSION) {
    return;
  }

  console.log('[CDC Excalidraw] Inicializando carregamento automático de bibliotecas padrão...');

  try {
    const manifestRes = await fetch('/libraries/manifest.json');
    if (!manifestRes.ok) {
      console.warn('[CDC Excalidraw] manifest.json de bibliotecas não encontrado.');
      return;
    }

    const manifest = await manifestRes.json();
    if (!manifest.libraries || !Array.isArray(manifest.libraries)) {
      return;
    }

    const allNewItems = [];

    for (const libInfo of manifest.libraries) {
      try {
        const libRes = await fetch(libInfo.url);
        if (libRes.ok) {
          const libData = await libRes.json();
          let items = [];
          if (libData.libraryItems && Array.isArray(libData.libraryItems)) {
            items = libData.libraryItems;
          } else if (Array.isArray(libData)) {
            items = libData;
          }
          allNewItems.push(...items);
        }
      } catch (err) {
        console.error(`[CDC Excalidraw] Erro ao carregar biblioteca ${libInfo.name}:`, err);
      }
    }

    if (allNewItems.length === 0) {
      return;
    }

    // 1. Atualizar IndexedDB (keyval-store / keyval -> 'excalidraw-library-items')
    const updateIndexedDB = new Promise((resolve) => {
      try {
        const req = indexedDB.open('keyval-store', 1);
        req.onupgradeneeded = function (e) {
          const db = e.target.result;
          if (!db.objectStoreNames.contains('keyval')) {
            db.createObjectStore('keyval');
          }
        };
        req.onsuccess = function (e) {
          const db = e.target.result;
          const tx = db.transaction('keyval', 'readwrite');
          const store = tx.objectStore('keyval');
          const getReq = store.get('excalidraw-library-items');

          getReq.onsuccess = function () {
            const existing = Array.isArray(getReq.result) ? getReq.result : [];
            const existingIds = new Set(existing.map((item) => item.id));
            const itemsToAdd = allNewItems.filter((item) => !existingIds.has(item.id));
            const merged = [...existing, ...itemsToAdd];

            const putReq = store.put(merged, 'excalidraw-library-items');
            putReq.onsuccess = () => resolve(merged);
            putReq.onerror = () => resolve(null);
          };
          getReq.onerror = () => resolve(null);
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        console.error('[CDC Excalidraw] Falha ao abrir IndexedDB:', e);
        resolve(null);
      }
    });

    const mergedItems = await updateIndexedDB;

    // 2. Atualizar LocalStorage como fallback para o Excalidraw
    try {
      let lsExisting = [];
      const lsRaw = localStorage.getItem('excalidraw-library-items');
      if (lsRaw) {
        lsExisting = JSON.parse(lsRaw);
      }
      const existingIds = new Set(lsExisting.map((item) => item.id));
      const itemsToAdd = allNewItems.filter((item) => !existingIds.has(item.id));
      const mergedLs = [...lsExisting, ...itemsToAdd];
      localStorage.setItem('excalidraw-library-items', JSON.stringify(mergedLs));
    } catch (lsErr) {
      console.warn('[CDC Excalidraw] LocalStorage quota ou indisponível:', lsErr);
    }

    localStorage.setItem(VERSION_KEY, BUNDLE_VERSION);
    console.log(`[CDC Excalidraw] ${allNewItems.length} componentes de bibliotecas corporativas carregados com sucesso!`);
  } catch (globalErr) {
    console.error('[CDC Excalidraw] Erro inesperado na injeção de bibliotecas:', globalErr);
  }
})();
