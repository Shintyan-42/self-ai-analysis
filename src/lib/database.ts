import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'career_app.db');
const db = new Database(dbPath);

// テーブル作成
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS interview_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    question_id TEXT,
    answer TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
  );

  CREATE TABLE IF NOT EXISTS analysis_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER,
    profile_data TEXT,
    recommendations TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions (id)
  );
`);

// プリペアドステートメント
export const stmts = {
  createUser: db.prepare('INSERT INTO users (email) VALUES (?)'),
  getUserByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  createSession: db.prepare('INSERT INTO interview_sessions (user_id, status) VALUES (?, ?)'),
  getSession: db.prepare('SELECT * FROM interview_sessions WHERE id = ?'),
  getUserSessions: db.prepare('SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC'),
  addResponse: db.prepare('INSERT INTO responses (session_id, question_id, answer) VALUES (?, ?, ?)'),
  getResponses: db.prepare('SELECT * FROM responses WHERE session_id = ? ORDER BY timestamp'),
  saveAnalysis: db.prepare('INSERT INTO analysis_results (session_id, profile_data, recommendations) VALUES (?, ?, ?)'),
  getAnalysis: db.prepare('SELECT * FROM analysis_results WHERE session_id = ? ORDER BY created_at DESC LIMIT 1'),
  getAllAnalyses: db.prepare('SELECT * FROM analysis_results ORDER BY created_at DESC'),
};

export default db;
