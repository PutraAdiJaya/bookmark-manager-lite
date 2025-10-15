import * as assert from 'assert';
import { generateId } from '../../../utils/idGenerator';

suite('ID Generator Test Suite', () => {
  test('should generate unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();

    assert.notStrictEqual(id1, id2);
  });

  test('should generate IDs of correct length', () => {
    const id = generateId();
    assert.strictEqual(id.length, 32); // 16 bytes = 32 hex characters
  });

  test('should generate IDs with only hex characters', () => {
    const id = generateId();
    assert.match(id, /^[0-9a-f]+$/);
  });
});
