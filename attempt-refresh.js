import fetch from 'node-fetch';

// Check API status
async function attemptRefreshData() {
  try {
    console.log('Checking API connection status...');
    const statusResponse = await fetch('http://localhost:8888/api/connection-status');
    
    if (!statusResponse.ok) {
      throw new Error(`Status API returned ${statusResponse.status}`);
    }
    
    const statusData = await statusResponse.json();
    console.log('Connection status:', statusData);
    
    // Test the invoices API
    console.log('\nTesting invoices API...');
    const invoiceResponse = await fetch('http://localhost:8888/api/dashboard/invoices');
    
    if (!invoiceResponse.ok) {
      const errorText = await invoiceResponse.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Invoices API returned ${invoiceResponse.status}`);
    }
    
    const invoiceData = await invoiceResponse.json();
    console.log(`Successfully retrieved ${invoiceData.length} invoices!`);
    if (invoiceData.length > 0) {
      console.log('First invoice:', invoiceData[0].invoice_number, 'from', invoiceData[0].supplier_name);
    }
    
    // Test the invoice aging API
    console.log('\nTesting invoice aging API...');
    const agingResponse = await fetch('http://localhost:8888/api/dashboard/invoices/aging');
    
    if (!agingResponse.ok) {
      const errorText = await agingResponse.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Invoice aging API returned ${agingResponse.status}`);
    }
    
    const agingData = await agingResponse.json();
    console.log(`Successfully retrieved invoice aging data with ${agingData.length} buckets!`);
    
    // Test the payment summary API
    console.log('\nTesting payment summary API...');
    const summaryResponse = await fetch('http://localhost:8888/api/dashboard/invoices/payment-summary');
    
    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error(`Error response: ${errorText}`);
      throw new Error(`Payment summary API returned ${summaryResponse.status}`);
    }
    
    const summaryData = await summaryResponse.json();
    console.log('Successfully retrieved payment summary data!');
    console.log(`Total invoices: ${summaryData.totalInvoices}, Unpaid: ${summaryData.unpaidInvoices}, Overdue: ${summaryData.overdueAmount} ${summaryData.currency}`);
    
    console.log('\nAll API tests passed successfully!');
  } catch (error) {
    console.error('Error accessing API:', error);
  }
}

attemptRefreshData();
