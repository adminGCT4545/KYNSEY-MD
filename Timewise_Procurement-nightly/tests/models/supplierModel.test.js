import { jest } from '@jest/globals';
import supplierModel from '../../backend/models/supplierModel.js';
import { pool } from '../../backend/models/supplierModel.js';
import NodeCache from 'node-cache';

describe('Supplier Model', () => {
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
    pool.connect.mockResolvedValue(mockClient);
  });

  describe('createPurchaseOrder', () => {
    const mockPurchaseOrder = {
      po_number: 'PO-2025-001',
      supplier_id: 1,
      department_id: 1,
      order_date: '2025-01-15',
      delivery_date: '2025-02-15',
      status: 'pending',
      payment_terms: 'Net 30',
      shipping_terms: 'FOB',
      total_amount: 1000,
      tax_amount: 100,
      shipping_amount: 50,
      currency: 'USD',
      is_blanket_po: false,
      items: [
        {
          item_name: 'Test Item',
          quantity: 10,
          unit_price: 100,
          total_price: 1000,
          tax_amount: 100,
          delivery_date: '2025-02-15',
          status: 'pending'
        }
      ]
    };

    it('should create purchase order with items in a transaction', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [{ po_id: 1 }] }) // Insert PO
        .mockResolvedValueOnce({ rows: [] }); // Insert items

      const result = await supplierModel.createPurchaseOrder(mockPurchaseOrder);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO purchase_orders'), expect.any(Array));
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(result).toHaveProperty('po_id', 1);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      mockClient.query
        .mockResolvedValueOnce() // BEGIN
        .mockRejectedValueOnce(new Error('Database error')); // Insert PO fails

      await expect(supplierModel.createPurchaseOrder(mockPurchaseOrder))
        .rejects.toThrow('Database error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('getProcurementSchedules', () => {
    const mockSchedules = [
      {
        supplier_id: 1,
        supplier_name: 'Test Supplier',
        scheduled_delivery: '09:00:00',
        default_delay_days: 0,
        total_orders: '10',
        delayed_orders: '2',
        avg_fulfillment_rate: '85.5'
      }
    ];

    it('should return cached schedules if available', async () => {
      const mockCache = new NodeCache();
      mockCache.get.mockReturnValue(mockSchedules);

      const result = await supplierModel.getProcurementSchedules();
      
      expect(result).toEqual(mockSchedules);
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should query and transform procurement schedules', async () => {
      const mockCache = new NodeCache();
      mockCache.get.mockReturnValue(null);
      pool.query.mockResolvedValue({ rows: mockSchedules });

      const result = await supplierModel.getProcurementSchedules();
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('total_orders', 10);
      expect(result[0]).toHaveProperty('avg_fulfillment_rate', 85.5);
      expect(result[0]).toHaveProperty('on_time_rate', 80);
    });
  });

  describe('getPurchaseOrders', () => {
    const mockOrders = [
      {
        order_id: 1,
        supplier_id: 1,
        supplier_name: 'Test Supplier',
        order_date: '2025-01-15',
        scheduled_delivery: '09:00:00',
        delay_days: 2,
        total_items: 10,
        fulfilled_items: 8,
        cost: '1000'
      }
    ];

    it('should apply filters correctly', async () => {
      const mockCache = new NodeCache();
      mockCache.get.mockReturnValue(null);
      pool.query.mockResolvedValue({ rows: mockOrders });

      const year = 2025;
      const supplierId = 1;
      const limit = 50;

      await supplierModel.getPurchaseOrders(year, supplierId, limit);
      
      expect(pool.query).toHaveBeenCalledWith(
        'EXECUTE get_purchase_orders($1, $2, $3)',
        [year, supplierId, limit]
      );
    });

    it('should transform purchase order data', async () => {
      const mockCache = new NodeCache();
      mockCache.get.mockReturnValue(null);
      pool.query.mockResolvedValue({ rows: mockOrders });

      const result = await supplierModel.getPurchaseOrders();
      
      expect(result[0]).toHaveProperty('fulfillmentRate', 80);
      expect(result[0]).toHaveProperty('cost', 1000);
      expect(result[0]).toHaveProperty('actual_delivery');
    });
  });

  describe('getDashboardStats', () => {
    const mockStats = {
      overall: { rows: [{ total_orders: '100', total_cost: '10000', delayed_orders: '20' }] },
      supplierStats: { rows: [] },
      locationStats: { rows: [] },
      priorityStats: { rows: [] }
    };

    it('should aggregate multiple stat queries', async () => {
      const mockCache = new NodeCache();
      mockCache.get.mockReturnValue(null);
      
      pool.query
        .mockResolvedValueOnce(mockStats.overall)
        .mockResolvedValueOnce(mockStats.supplierStats)
        .mockResolvedValueOnce(mockStats.locationStats)
        .mockResolvedValueOnce(mockStats.priorityStats);

      const result = await supplierModel.getDashboardStats();
      
      expect(result).toHaveProperty('overall');
      expect(result.overall).toHaveProperty('onTimePerformance', 80);
      expect(pool.query).toHaveBeenCalledTimes(4);
    });
  });

  describe('clearCache', () => {
    it('should clear cache and log action', () => {
      const mockCache = new NodeCache();
      
      supplierModel.clearCache();
      
      expect(mockCache.flushAll).toHaveBeenCalled();
    });
  });
});