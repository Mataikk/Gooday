import * as SQLite from 'expo-sqlite';

// 1. Ouvrir (ou créer) la base de données "journal.db"
const db = SQLite.openDatabaseSync('gooday.db');

export const Database = {
  // --- INITIALISATION ---
  // Cette fonction crée la table si elle n'existe pas encore
  init: () => {
    // On exécute du SQL standard : CREATE TABLE IF NOT EXISTS
    // id: identifiant unique
    // content: le texte de ta note
    // date: la date au format 'YYYY-MM-DD' (ex: 2023-12-02)
    // created_at: pour trier par heure précise si besoin
    return db.execSync(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        date TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  },

  // --- AJOUTER UNE NOTE ---
  addLog: (content: string, date: string) => {
    const createdAt = Date.now();
    // On insère les données. Le ? est remplacé par les valeurs (sécurité)
    return db.runSync(
      'INSERT INTO logs (content, date, created_at) VALUES (?, ?, ?)',
      [content, date, createdAt]
    );
  },

  // --- LIRE LES NOTES D'UN JOUR ---
  getLogsByDate: (date: string) => {
    // On récupère tout (*) depuis 'logs' OÙ la date correspond
    // On trie par 'created_at' descendant (du plus récent au plus vieux)
    return db.getAllSync(
      'SELECT * FROM logs WHERE date = ? ORDER BY created_at DESC',
      [date]
    );
  },

  // --- LIRE TOUT L'HISTORIQUE (Pour plus tard) ---
  getAllLogs: () => {
    return db.getAllSync('SELECT * FROM logs ORDER BY date DESC, created_at DESC');
  },
  
  // --- SUPPRIMER UNE NOTE (Optionnel pour l'instant) ---
  deleteLog: (id: number) => {
    return db.runSync('DELETE FROM logs WHERE id = ?', [id]);
  }
};