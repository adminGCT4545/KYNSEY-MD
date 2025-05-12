import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock IntersectionObserver for react-window tests
class MockIntersectionObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}
global.IntersectionObserver = MockIntersectionObserver as any;

// Mock ResizeObserver for react-virtualized tests
class MockResizeObserver {
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
  disconnect() {
    return null;
  }
}
global.ResizeObserver = MockResizeObserver as any;