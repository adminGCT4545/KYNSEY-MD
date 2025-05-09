import fetch from 'node-fetch';

// Test the invoices endpoint
async function testInvoicesEndpoint() {
  try {
    console.log('Testing /api/dashboard/invoices endpoint...');
    const response = await fetch('http://localhost:8888/api/dashboard/invoices');
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log(`Successfully retrieved ${data.length} invoices`);
    console.log('First invoice:', JSON.stringify(data[0], null, 2));
  } catch (error) {
    console.error('Failed to fetch invoices:', error);
  }
}

// Test the invoice aging endpoint
async function testInvoiceAgingEndpoint() {
  try {
    console.log('\nTesting /api/dashboard/invoices/aging endpoint...');
    const response = await fetch('http://localhost:8888/api/dashboard/invoices/aging');
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Successfully retrieved invoice aging data');
    console.log('Aging data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch invoice aging data:', error);
  }
}

// Test the payment summary endpoint
async function testPaymentSummaryEndpoint() {
  try {
    console.log('\nTesting /api/dashboard/invoices/payment-summary endpoint...');
    const response = await fetch('http://localhost:8888/api/dashboard/invoices/payment-summary');
    
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Successfully retrieved payment summary data');
    console.log('Payment summary:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Failed to fetch payment summary:', error);
  }
}

// Run all tests
async function runTests() {
  await testInvoicesEndpoint();
  await testInvoiceAgingEndpoint();
  await testPaymentSummaryEndpoint();
}

runTests();
