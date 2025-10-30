import { randomUUID } from "node:crypto";
import { Models } from "../../../server/database/index.js";

export function createUser(name = randomUUID()) {
  const user = Models.User.create({ name });

  return user;
}

export function createAdminUser(slug) {
  const user = createUser(slug);

  Models.Admin.create({ user_id: user.id });

  return user;
}
