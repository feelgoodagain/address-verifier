import { Client } from '@elastic/elasticsearch';

export const esClient = new Client({
  node: process.env.ELASTIC_NODE!,
  auth: { apiKey: process.env.ELASTIC_API_KEY! },
  serverMode: 'serverless',
});

const first = (process.env.FIRSTNAME || 'first').toLowerCase();
const last = (process.env.LASTNAME || 'last').toLowerCase();

export const USERS_INDEX = `${first}-${last}-users`;
export const LOGS_INDEX = `${first}-${last}-logs`;


export async function ensureIndex(index: string) {
  try {
    await esClient.indices.create({ index });
  } catch (e: any) {
    
  }
}