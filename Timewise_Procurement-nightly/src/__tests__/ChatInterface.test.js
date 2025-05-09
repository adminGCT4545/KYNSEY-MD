global.TextEncoder = require('util').TextEncoder;

global.TextEncoder = require('util').TextEncoder;
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Test response' })
  })
);

const React = require('react');
const { render, screen, fireEvent } = require('@testing-library/react');
require('@testing-library/jest-dom');
const ChatInterface = require('../components/ChatInterface').default;
const ChatProvider = require('../components/ChatInterface').ChatProvider;
const DashboardContext = require('../components/Dashboard').DashboardContext;

jest.mock('../services/dataService', () => ({
  transformData: jest.fn().mockResolvedValue([]),
  getAvailableYears: jest.fn().mockResolvedValue([]),
  getUpcomingDepartures: jest.fn().mockResolvedValue([])
}));

describe('ChatInterface Component', () => {
  beforeEach(() => {
    render(
      <DashboardContext.Provider value={{ selectedTrain: 'Test Train', selectedYear: '2023' }}>
        <ChatProvider>
          <ChatInterface />
        </ChatProvider>
      </DashboardContext.Provider>
    );
  });

  it('renders without errors and shows chat when clicked', async () => {
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    const chatHeader = await screen.findByText(/ERP-Kynsey AI Assistant/i);
    expect(chatHeader).toBeInTheDocument();
  });

  it('shows welcome message when opened', async () => {
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    const welcomeMessage = await screen.findByText(/How can I help you with your train operations today?/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  it('can be closed after opening', async () => {
    // Open chat
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);
    
    // Find and click close button (it's the one within the header)
    const headerDiv = screen.getByRole('heading', { name: /ERP-Kynsey AI Assistant/i }).parentElement;
    const closeButton = headerDiv.querySelector('button');
    fireEvent.click(closeButton);
    
    // After clicking close, we should see the initial chat toggle button
    const chatToggleButton = screen.getByRole('button');
    expect(chatToggleButton).toHaveClass('fixed', 'bottom-6', 'right-6');
  });

  it('allows sending messages', async () => {
    // Open chat
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    // Find input and send button
    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    // Type and send a message
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    // Check that the message appears
    const message = await screen.findByText('Test message');
    expect(message).toBeInTheDocument();
  });
});