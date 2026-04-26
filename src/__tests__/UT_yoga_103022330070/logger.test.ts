import { logger } from '@/lib/logger';

describe('logger utility', () => {
  let errorSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    warnSpy.mockRestore();
  });

  describe('logger.error', () => {
    it('calls console.error with a string message', () => {
      logger.error('fetch failed');
      expect(errorSpy).toHaveBeenCalledWith('fetch failed');
    });

    it('calls console.error with an Error object', () => {
      const err = new Error('network error');
      logger.error('request failed:', err);
      expect(errorSpy).toHaveBeenCalledWith('request failed:', err);
    });

    it('calls console.error exactly once per call', () => {
      logger.error('test');
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call console.warn when using logger.error', () => {
      logger.error('problem');
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('logger.warn', () => {
    it('calls console.warn with a string message', () => {
      logger.warn('deprecated usage');
      expect(warnSpy).toHaveBeenCalledWith('deprecated usage');
    });

    it('calls console.warn with additional data', () => {
      logger.warn('key missing', { key: 'token' });
      expect(warnSpy).toHaveBeenCalledWith('key missing', { key: 'token' });
    });

    it('calls console.warn exactly once per call', () => {
      logger.warn('once');
      expect(warnSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call console.error when using logger.warn', () => {
      logger.warn('heads up');
      expect(errorSpy).not.toHaveBeenCalled();
    });
  });
});
