import { mockDatabase } from '../';
import type { Database } from '../../database';

describe('set field', () => {
  let db: Database;

  beforeEach(async () => {
    db = mockDatabase();
  });

  afterEach(async () => {
    await db.close();
  });

  it('should set Set field', async () => {
    const A = db.collection({
      name: 'a',
      fields: [
        {
          type: 'set',
          name: 'set',
        },
      ],
    });

    await db.sync();

    const a = await A.repository.create({});

    a.set('set', ['a', 'b', 'c', 'a']);

    await a.save();

    const setValue = a.get('set');
    expect(setValue).toEqual(['a', 'b', 'c']);
  });
});
