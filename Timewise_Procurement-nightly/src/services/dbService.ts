// Database service that makes API calls to the backend server
import { type QueryResult } from 'pg';

// Types
interface QueryOptions {
  text: string;
  params?: any[];
}

// Empty QueryResult for testing environment
const emptyQueryResult: QueryResult = {
  rows: [],
  command: 'SELECT',
  rowCount: 0,
  oid: 0,
  fields: []
};

// Helper function to execute queries through the backend API
export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
  // Mock the query function for testing
  if (process.env.NODE_ENV === 'test') {
    console.log('Using empty query result for testing');
    return emptyQueryResult;
  }

  try {
    const start = Date.now();
    console.log(`Sending query to backend: ${text}`);
    
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, params }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Database query failed:', errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const duration = Date.now() - start;
    
    // The backend now returns the rows directly as an array
    const rows = Array.isArray(data) ? data : [];
    console.log(`Executed query - Duration: ${duration}ms, Rows: ${rows.length}`);
    
    return {
      rows,
      command: 'SELECT',
      rowCount: rows.length,
      oid: 0,
      fields: []
    };
  } catch (error) {
    console.error('Error executing query:', error);
    console.error('Query text:', text);
    console.error('Query params:', params);
    
    // No fallback to mock data - only use PostgreSQL data
    console.error('Query failed - no fallback to mock data');
    
    throw error;
  }
};

// No need to export pool anymore since we're using the API
export default query;
