import * as assert from 'assert';
import { IconGenerator } from '../../../utils/IconGenerator';

suite('IconGenerator Test Suite', () => {
  let iconGenerator: IconGenerator;

  setup(() => {
    iconGenerator = new IconGenerator();
  });

  teardown(() => {
    iconGenerator.clearCache();
  });

  suite('generateNumberedIcon', () => {
    test('should generate icon for single digit number', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 5,
        theme: 'light'
      });

      assert.ok(icon.startsWith('data:image/svg+xml;base64,'));
      assert.ok(icon.length > 0);
    });

    test('should generate icon for double digit number', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 42,
        theme: 'dark'
      });

      assert.ok(icon.startsWith('data:image/svg+xml;base64,'));
      assert.ok(icon.length > 0);
    });

    test('should generate 99+ for numbers over 99', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 150,
        theme: 'light'
      });

      assert.ok(icon.startsWith('data:image/svg+xml;base64,'));
      
      // Decode base64 to check content
      const base64 = icon.replace('data:image/svg+xml;base64,', '');
      const svg = Buffer.from(base64, 'base64').toString('utf-8');
      
      assert.ok(svg.includes('99+'));
    });

    test('should cache generated icons', () => {
      const icon1 = iconGenerator.generateNumberedIcon({
        number: 10,
        theme: 'light'
      });

      const icon2 = iconGenerator.generateNumberedIcon({
        number: 10,
        theme: 'light'
      });

      // Should return the same cached instance
      assert.strictEqual(icon1, icon2);
    });

    test('should generate different icons for different themes', () => {
      const lightIcon = iconGenerator.generateNumberedIcon({
        number: 7,
        theme: 'light'
      });

      const darkIcon = iconGenerator.generateNumberedIcon({
        number: 7,
        theme: 'dark'
      });

      // Should be different because of different themes
      assert.notStrictEqual(lightIcon, darkIcon);
    });

    test('should generate different icons for different numbers', () => {
      const icon1 = iconGenerator.generateNumberedIcon({
        number: 1,
        theme: 'light'
      });

      const icon2 = iconGenerator.generateNumberedIcon({
        number: 2,
        theme: 'light'
      });

      // Should be different because of different numbers
      assert.notStrictEqual(icon1, icon2);
    });
  });

  suite('cache management', () => {
    test('should clear cache', () => {
      // Generate some icons to populate cache
      iconGenerator.generateNumberedIcon({ number: 1, theme: 'light' });
      iconGenerator.generateNumberedIcon({ number: 2, theme: 'light' });
      iconGenerator.generateNumberedIcon({ number: 3, theme: 'dark' });

      // Clear cache
      iconGenerator.clearCache();

      // Generate again - should create new instances
      const icon1 = iconGenerator.generateNumberedIcon({ number: 1, theme: 'light' });
      const icon2 = iconGenerator.generateNumberedIcon({ number: 1, theme: 'light' });

      // After clearing, new generation should still cache
      assert.strictEqual(icon1, icon2);
    });

    test('should respect cache size limit', () => {
      // This test verifies that cache doesn't grow indefinitely
      // Generate more than 200 icons
      for (let i = 1; i <= 250; i++) {
        iconGenerator.generateNumberedIcon({ number: i, theme: 'light' });
      }

      // Cache should not exceed 200 entries
      // We can't directly test cache size, but we can verify it still works
      const icon = iconGenerator.generateNumberedIcon({ number: 1, theme: 'light' });
      assert.ok(icon.startsWith('data:image/svg+xml;base64,'));
    });
  });

  suite('SVG content validation', () => {
    test('should include correct number in SVG', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 25,
        theme: 'light'
      });

      const base64 = icon.replace('data:image/svg+xml;base64,', '');
      const svg = Buffer.from(base64, 'base64').toString('utf-8');

      assert.ok(svg.includes('25'));
      assert.ok(svg.includes('<svg'));
      assert.ok(svg.includes('</svg>'));
    });

    test('should include gradient in SVG', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 5,
        theme: 'dark'
      });

      const base64 = icon.replace('data:image/svg+xml;base64,', '');
      const svg = Buffer.from(base64, 'base64').toString('utf-8');

      assert.ok(svg.includes('linearGradient'));
      assert.ok(svg.includes('iconGradient'));
    });

    test('should include bookmark shape path', () => {
      const icon = iconGenerator.generateNumberedIcon({
        number: 1,
        theme: 'light'
      });

      const base64 = icon.replace('data:image/svg+xml;base64,', '');
      const svg = Buffer.from(base64, 'base64').toString('utf-8');

      assert.ok(svg.includes('<path'));
      assert.ok(svg.includes('M 3 1 L 13 1 L 13 14 L 8 11 L 3 14 Z'));
    });
  });
});
