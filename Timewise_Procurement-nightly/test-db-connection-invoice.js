import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  // Create a new pool with the provided credentials
  const pool = new pg.Pool({
    host: process.env.PGHOST || 'localhost',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'timewise_procument',
    port: parseInt(process.env.PGPORT || '5432'),
  });

  console.log('Attempting to connect to PostgreSQL...');
  try {
    // Test the connection
    const client = await pool.connect();
    console.log('Successfully connected to PostgreSQL!');
    
    // Test querying invoices
    console.log('\nTesting invoice query...');
    const invoiceQuery = `
      SELECT 
        i.invoice_id, 
        i.invoice_number, 
        i.supplier_id, 
        s.supplier_name,
        i.po_id, 
        i.invoice_date, 
        i.due_date, 
        i.status, 
        i.total_amount
      FROM 
        invoices i
      JOIN 
        suppliers s ON i.supplier_id = s.supplier_id
      LIMIT 5
    `;
    
    const invoiceResult = await pool.query(invoiceQuery);
    console.log(`Retrieved ${invoiceResult.rows.length} invoices:`);
    console.log(JSON.stringify(invoiceResult.rows[0], null, 2));
    
    // Test querying invoice aging
    console.log('\nTesting invoice aging query...');
    const agingQuery = `
      SELECT 
        CASE 
          WHEN status = 'paid' THEN 'Paid'
          WHEN due_date >= CURRENT_DATE THEN 'Not Due'
          WHEN due_date >= CURRENT_DATE - INTERVAL '30 days' THEN '1-30 days'
          WHEN due_date >= CURRENT_DATE - INTERVAL '60 days' THEN '31-60 days'
          WHEN due_date >= CURRENT_DATE - INTERVAL '90 days' THEN '61-90 days'
          ELSE 'Over 90 days'
        END as aging_bucket,
        COUNT(*) as invoice_count,
        SUM(total_amount) as total_amount
      FROM 
        invoices
      GROUP BY 
        aging_bucket
      ORDER BY 
        aging_bucket
    `;
    
    const agingResult = await pool.query(agingQuery);
    console.log(`Retrieved ${agingResult.rows.length} aging buckets:`);
    console.log(JSON.stringify(agingResult.rows, null, 2));
    
    // Clean up
    client.release();
    await pool.end();
    console.log('\nConnection pool closed.');
  } catch (error) {
    console.error('Database connection error:', error);
  }
}

// Run the test
testDatabaseConnection();
