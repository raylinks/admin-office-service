import * as url from 'url';

interface IDBConfig {
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

export const parseDbUrl = (dbUrl: string) => {
  const db: any = {};

  const parsedUrl = new url.URL(dbUrl);

  // Extract username and password from the URL
  if (parsedUrl.username) {
    db.username = parsedUrl.username;
  }
  if (parsedUrl.password) {
    db.password = parsedUrl.password;
  }

  // Extract host and port from the URL
  db.host = parsedUrl.hostname;
  db.port = parseInt(parsedUrl.port, 10);

  // Extract database name from the URL
  db.database = parsedUrl.pathname.slice(1);

  return db;
};
