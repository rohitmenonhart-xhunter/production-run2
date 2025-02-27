import { MongoClient, Db } from 'mongodb';

export function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}>; 