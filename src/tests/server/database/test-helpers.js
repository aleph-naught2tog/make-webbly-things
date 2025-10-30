import { randomUUID } from 'node:crypto';
import { Models } from '../../../server/database/index.js';

export function createUser() {
  const username = randomUUID();
  const user = Models.User.create({ name: username });

  return user;
}

export function createAdminUser() {
  const user = createUser();

  Models.Admin.create({ user_id: user.id });

  return user;
}
