import { jest } from '@jest/globals';
import * as dataService from '../../src/services/dataService';
import { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

describe('Data Service Integration Tests', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('Member Management', () => {
    const mockMembers = [
      {
        member_id: 1,
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
        membership_type: 'premium'
      }
    ];

    it('should fetch members successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockMembers));
      
      const result = await dataService.getMembers();
      
      expect(result).toEqual(mockMembers);
      expect(fetchMock).toHaveBeenCalledWith('/api/member-management/members');
    });

    it('should handle member fetch errors', async () => {
      fetchMock.mockRejectOnce(new Error('API Error'));
      
      const result = await dataService.getMembers();
      
      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(0);
    });

    it('should fetch member status summary', async () => {
      const mockSummary = [
        { status: 'active', member_count: 10, total_points: 1000 }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockSummary));
      
      const result = await dataService.getMemberStatusSummary();
      
      expect(result).toEqual(mockSummary);
      expect(fetchMock).toHaveBeenCalledWith('/api/member-management/status-summary');
    });
  });

  describe('Supplier Management', () => {
    const mockSuppliers = [
      {
        supplier_id: 1,
        supplier_name: 'Acme Supplies',
        supplier_status: 'active'
      }
    ];

    it('should fetch suppliers successfully', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockSuppliers));
      
      const result = await dataService.getSuppliers();
      
      expect(result).toEqual(mockSuppliers);
      expect(fetchMock).toHaveBeenCalledWith('/api/dashboard/suppliers');
    });

    it('should handle supplier fetch errors', async () => {
      fetchMock.mockRejectOnce(new Error('API Error'));
      
      const result = await dataService.getSuppliers();
      
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('Purchase Orders', () => {
    const mockOrders = [
      {
        po_id: 1,
        po_number: 'PO-2025-001',
        supplier_name: 'Acme Supplies',
        status: 'pending'
      }
    ];

    it('should fetch purchase orders with filters', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(mockOrders));
      
      const result = await dataService.getPurchaseOrders('pending');
      
      expect(result).toEqual(mockOrders);
      expect(fetchMock).toHaveBeenCalledWith('/api/dashboard/purchase-orders?status=pending');
    });

    it('should fetch purchase order summary', async () => {
      const mockSummary = [
        { status: 'pending', po_count: 5, total_value: 5000 }
      ];
      fetchMock.mockResponseOnce(JSON.stringify(mockSummary));
      
      const result = await dataService.getPurchaseOrderStatusSummary();
      
      expect(result).toEqual(mockSummary);
      expect(fetchMock).toHaveBeenCalledWith('/api/dashboard/purchase-orders/summary');
    });
  });

  describe('Live Updates', () => {
    let mockEventSource;

    beforeEach(() => {
      mockEventSource = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        close: jest.fn()
      };
      global.EventSource = jest.fn(() => mockEventSource);
    });

    it('should connect to live updates', () => {
      const listener = jest.fn();
      dataService.addSupplierUpdateListener(listener);
      dataService.connectToLiveUpdates();
      
      expect(global.EventSource).toHaveBeenCalledWith('/api/live-updates');
    });

    it('should handle live update messages', () => {
      const listener = jest.fn();
      dataService.addSupplierUpdateListener(listener);
      
      const mockEvent = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'supplier_changes',
          data: { id: 1, status: 'updated' }
        })
      });

      dataService.connectToLiveUpdates();
      mockEventSource.onmessage(mockEvent);
      
      expect(listener).toHaveBeenCalledWith({ id: 1, status: 'updated' });
    });

    it('should handle disconnection and cleanup', () => {
      dataService.connectToLiveUpdates();
      dataService.disconnectFromLiveUpdates();
      
      expect(mockEventSource.close).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      fetchMock.mockRejectOnce(new Error('Network error'));
      
      const result = await dataService.transformData();
      
      expect(result).toEqual([]);
    });

    it('should handle invalid JSON responses', async () => {
      fetchMock.mockResponseOnce('invalid json');
      
      const result = await dataService.getMembers();
      
      expect(result).toEqual(expect.any(Array));
    });

    it('should handle non-200 responses', async () => {
      fetchMock.mockResponseOnce('', { status: 500 });
      
      const result = await dataService.getSuppliers();
      
      expect(result).toEqual(expect.any(Array));
    });
  });
});