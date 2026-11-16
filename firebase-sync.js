// Fifa Legends — camada de sincronização com Firebase (Firestore).
// Expõe window.FifaSync com funções simples pra qualquer página usar,
// sem precisar lidar com Firebase diretamente. Se o Firebase não
// carregar (sem internet, bloqueado, etc.), tudo cai graciosamente
// pra "não tenho nuvem agora" e o app continua funcionando só com
// localStorage, como antes.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore, doc, getDoc, setDoc, onSnapshot
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6l5mhBAiVW-D-11xKagpYDfUJ4lsXbn8",
  authDomain: "fifalegends-7bdaa.firebaseapp.com",
  projectId: "fifalegends-7bdaa",
  storageBucket: "fifalegends-7bdaa.firebasestorage.app",
  messagingSenderId: "839108535033",
  appId: "1:839108535033:web:4097716f43c4ca831f7828"
};

const COLLECTION = 'fifa_legends';

let db = null;
let ready = false;

const readyPromise = (async () => {
  try{
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    ready = true;
  } catch(e){
    console.error('Firebase não inicializou, seguindo só com localStorage', e);
    ready = false;
  }
})();

function docRef(key){
  return doc(db, COLLECTION, key);
}

/** Busca o documento salvo na nuvem. Retorna null se não existir, não tiver
 * internet, ou o Firebase não tiver inicializado. */
async function load(key){
  await readyPromise;
  if(!ready) return null;
  try{
    const snap = await getDoc(docRef(key));
    if(!snap.exists()) return null;
    const d = snap.data();
    return { data: d.data, updatedAt: d.updatedAt || 0 };
  } catch(e){
    console.warn('FifaSync: não consegui buscar', key, e);
    return null;
  }
}

/** Salva na nuvem. updatedAt é um número (Date.now()) pra comparar depois
 * qual versão é mais nova — local ou nuvem — sem depender de relógio de
 * servidor. Silencioso em caso de erro (offline etc.), o app não trava. */
async function save(key, data, updatedAt){
  await readyPromise;
  if(!ready) return false;
  try{
    await setDoc(docRef(key), { data, updatedAt });
    return true;
  } catch(e){
    console.warn('FifaSync: não consegui salvar', key, e);
    return false;
  }
}

/** Observa mudanças remotas em tempo real. callback(data, updatedAt) é
 * chamado toda vez que o documento mudar na nuvem (inclusive por causa do
 * nosso próprio save, então quem usa isso precisa ser tolerante a chamadas
 * repetidas com os mesmos dados). Retorna uma função pra parar de observar. */
function watch(key, callback){
  let unsub = () => {};
  readyPromise.then(() => {
    if(!ready) return;
    unsub = onSnapshot(docRef(key), (snap) => {
      if(!snap.exists()) return;
      const d = snap.data();
      callback(d.data, d.updatedAt || 0);
    }, (err) => {
      console.warn('FifaSync: observação parou', key, err);
    });
  });
  return () => unsub();
}

window.FifaSync = {
  ready: readyPromise.then(() => ready),
  KEYS: { PLAYERS:'players', WL:'wl' },
  load,
  save,
  watch
};
