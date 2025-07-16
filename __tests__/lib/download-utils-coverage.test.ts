import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { 
  downloadFileSecure, 
  downloadAsCSV, 
  downloadMultipleCSV, 
  downloadCSVAsZip,
  downloadQRCode,
  downloadQRCodeAsFormat 
} from '@/lib/download-utils';

// Mock browser APIs
Object.defineProperty(global, 'document', {
  value: {
    createElement: jest.fn().mockReturnValue({
      href: '',
      download: '',
      click: jest.fn(),
      remove: jest.fn(),
    }),
    body: {
      appendChild: jest.fn(),
      removeChild: jest.fn(),
    },
  },
  writable: true,
});

Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(global, 'Blob', {
  value: jest.fn().mockImplementation((content, options) => ({
    size: Array.isArray(content) ? content.join('').length : 0,
    type: options?.type || 'application/octet-stream',
  })),
  writable: true,
});

// Mock canvas
jest.mock('canvas', () => ({
  createCanvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      fillStyle: '',
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      drawImage: jest.fn(),
      putImageData: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(4),
        width: 1,
        height: 1,
      })),
    })),
    toBuffer: jest.fn(() => Buffer.from('mock-image')),
    toDataURL: jest.fn(() => 'data:image/png;base64,mock-image'),
    width: 200,
    height: 200,
  })),
  loadImage: jest.fn(() => Promise.resolve({
    width: 100,
    height: 100,
  })),
}));

describe('Download Utils Coverage Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('downloadFileSecure', () => {
    it('should handle different file types', async () => {
      const testCases = [
        { content: 'text content', filename: 'test.txt', mimeType: 'text/plain' },
        { content: '{"key": "value"}', filename: 'test.json', mimeType: 'application/json' },
        { content: 'csv,data\n1,2', filename: 'test.csv', mimeType: 'text/csv' },
      ];

      for (const { content, filename, mimeType } of testCases) {
        const result = await downloadFileSecure(content, filename, mimeType);
        expect(result).toBe(true);
      }
    });

    it('should handle empty content', async () => {
      const result = await downloadFileSecure('', 'empty.txt', 'text/plain');
      expect(result).toBe(true);
    });

    it('should handle special characters in filename', async () => {
      const result = await downloadFileSecure('content', 'test file (1).txt', 'text/plain');
      expect(result).toBe(true);
    });
  });

  describe('downloadAsCSV', () => {
    it('should handle various data structures', async () => {
      const testData = [
        { id: 1, name: 'Test 1', value: 'A' },
        { id: 2, name: 'Test 2', value: 'B' },
      ];

      const result = await downloadAsCSV(testData, 'test-data.csv');
      expect(result).toBe(true);
    });

    it('should handle empty data', async () => {
      const result = await downloadAsCSV([], 'empty.csv');
      expect(result).toBe(true);
    });

    it('should handle data with special characters', async () => {
      const testData = [
        { id: 1, name: 'Test "quoted"', value: 'Line\nBreak' },
        { id: 2, name: 'Test, comma', value: 'Semicolon;' },
      ];

      const result = await downloadAsCSV(testData, 'special-chars.csv');
      expect(result).toBe(true);
    });
  });

  describe('downloadMultipleCSV', () => {
    it('should handle multiple CSV files', async () => {
      const csvFiles = [
        { filename: 'file1.csv', data: [{ id: 1, name: 'Test 1' }] },
        { filename: 'file2.csv', data: [{ id: 2, name: 'Test 2' }] },
      ];

      const result = await downloadMultipleCSV(csvFiles, 'multiple-files.zip');
      expect(result).toBe(true);
    });

    it('should handle empty files array', async () => {
      const result = await downloadMultipleCSV([], 'empty-zip.zip');
      expect(result).toBe(true);
    });
  });

  describe('downloadCSVAsZip', () => {
    it('should create zip from CSV data', async () => {
      const csvData = 'id,name\n1,Test';
      const result = await downloadCSVAsZip(csvData, 'test.zip');
      expect(result).toBe(true);
    });

    it('should handle empty CSV data', async () => {
      const result = await downloadCSVAsZip('', 'empty.zip');
      expect(result).toBe(true);
    });
  });

  describe('downloadQRCode', () => {
    it('should download QR code in different formats', async () => {
      const qrData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const formats = ['png', 'jpg', 'svg', 'webp'];
      
      for (const format of formats) {
        const result = await downloadQRCode(qrData, `qrcode.${format}`, format as any);
        expect(result).toBe(true);
      }
    });

    it('should handle invalid QR data', async () => {
      const result = await downloadQRCode('invalid-data', 'invalid.png', 'png');
      expect(result).toBe(false);
    });
  });

  describe('downloadQRCodeAsFormat', () => {
    it('should convert QR code to different formats', async () => {
      const qrData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      const formats = ['png', 'jpg', 'svg', 'webp'];
      
      for (const format of formats) {
        const result = await downloadQRCodeAsFormat(qrData, `converted.${format}`, format as any);
        expect(result).toBe(true);
      }
    });

    it('should handle conversion errors', async () => {
      const result = await downloadQRCodeAsFormat('invalid-data', 'error.png', 'png');
      expect(result).toBe(false);
    });

    it('should handle unsupported formats', async () => {
      const qrData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const result = await downloadQRCodeAsFormat(qrData, 'test.xyz', 'xyz' as any);
      expect(result).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should handle DOM manipulation errors', async () => {
      // Mock document.createElement to throw an error
      const originalCreateElement = global.document.createElement;
      global.document.createElement = jest.fn().mockImplementation(() => {
        throw new Error('DOM error');
      });

      const result = await downloadFileSecure('content', 'test.txt', 'text/plain');
      expect(result).toBe(false);

      // Restore original implementation
      global.document.createElement = originalCreateElement;
    });

    it('should handle Blob creation errors', async () => {
      // Mock Blob constructor to throw an error
      const originalBlob = global.Blob;
      global.Blob = jest.fn().mockImplementation(() => {
        throw new Error('Blob error');
      });

      const result = await downloadFileSecure('content', 'test.txt', 'text/plain');
      expect(result).toBe(false);

      // Restore original implementation
      global.Blob = originalBlob;
    });

    it('should handle URL creation errors', async () => {
      // Mock URL.createObjectURL to throw an error
      const originalCreateObjectURL = global.URL.createObjectURL;
      global.URL.createObjectURL = jest.fn().mockImplementation(() => {
        throw new Error('URL error');
      });

      const result = await downloadFileSecure('content', 'test.txt', 'text/plain');
      expect(result).toBe(false);

      // Restore original implementation
      global.URL.createObjectURL = originalCreateObjectURL;
    });
  });
});