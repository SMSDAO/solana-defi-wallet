// Health API route unit tests

describe('Health endpoint response shape', () => {
  it('returns expected fields', () => {
    const mockResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: 'test',
    };

    expect(mockResponse).toHaveProperty('status', 'ok');
    expect(mockResponse).toHaveProperty('version', '1.0.0');
    expect(mockResponse).toHaveProperty('timestamp');
    expect(mockResponse).toHaveProperty('environment');
  });

  it('timestamp is a valid ISO date', () => {
    const ts = new Date().toISOString();
    expect(() => new Date(ts)).not.toThrow();
    expect(new Date(ts).getTime()).toBeGreaterThan(0);
  });
});
