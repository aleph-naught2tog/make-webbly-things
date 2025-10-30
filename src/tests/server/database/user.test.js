import test, { after, afterEach, before, describe } from "node:test";
import assert from "node:assert/strict";
import { resolve, join } from "node:path";
import { randomUUID } from "node:crypto";
import * as User from "../../../server/database/user.js";
import {
  initTestDatabase,
  concludeTesting,
  clearTestData,
  Models,
} from "../../../server/database/index.js";
import { ROOT_DIR } from "../../../helpers.js";
import dotenv from "@dotenvx/dotenvx";
const envPath = resolve(join(ROOT_DIR, `.env`));
dotenv.config({ quiet: true, path: envPath });

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} created_at
 * @property {string} enabled_at
 * @property {string} bio
 */

/**
 * Creates a user with a random, unique name
 *
 * @returns {User} the created user
 */
const createUser = () => {
  const username = randomUUID();
  const user = Models.User.create({ name: username });

  return user;
};

/**
 * Creates an admin user
 *
 * @returns {User} the admin user
 */
const createAdminUser = () => {
  const user = createUser();

  Models.Admin.create({ user_id: user.id });

  return user;
};

describe(`user tests`, async () => {
  before(async () => await initTestDatabase());
  afterEach(() => clearTestData());
  after(() => concludeTesting());

  /*
  export function processUserLogin(userObject) {
  */

  test(`deleteUser`, () => {
    const user = createUser();
    User.deleteUser(user);
  });

  test(`enable/disable`, () => {
    let user = createUser();
    const username = user.name;

    User.enableUser(user);
    user = User.getUser(username);
    assert.notEqual(user.enabled_at, null);

    User.disableUser(user);
    user = User.getUser(username);
    assert.equal(user.enabled_at, null);
  });

  test(`getAllUsers`, () => {
    createUser();
    createUser();
    const users = User.getAllUsers();
    assert.equal(users.length, 2);
  });

  test(`userIsAdmin`, () => {
    const admin = createAdminUser();
    const user = createUser();

    assert.equal(User.userIsAdmin(admin), true);
    assert.equal(User.userIsAdmin(user), false);
  });

  test(`getUserSettings`, () => {
    const admin = createAdminUser();
    let settings = User.getUserSettings(admin);
    assert.deepEqual(settings, {
      name: admin.name,
      admin: true,
      enabled: true,
      suspended: false,
    });

    const user = createUser();
    User.suspendUser(user, `why not`);
    User.disableUser(user);
    settings = User.getUserSettings(user);
    assert.deepEqual(settings, {
      name: user.name,
      admin: false,
      enabled: false,
      suspended: true,
    });
  });

  test(`getUserSuspensions`, () => {
    const user = createUser();
    const s = User.suspendUser(user, `why not`);
    User.unsuspendUser(s.id);
    User.suspendUser(user, `why not, again`);
    let list = User.getUserSuspensions(user);
    assert.equal(list.length, 1);
    list = User.getUserSuspensions(user, true);
    assert.equal(list.length, 2);
  });

  test(`hasAccessToUserRecords`, () => {
    const admin = createAdminUser();
    const user = createUser();
    const rando = createUser();

    assert.equal(User.hasAccessToUserRecords(user, user), true);
    assert.equal(User.hasAccessToUserRecords(admin, user), true);
    assert.equal(User.hasAccessToUserRecords(user, rando), false);
  });
});
