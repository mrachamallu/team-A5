// Wrapper around postgres data functions for the User Model. Requires a
// postgres connection and ability to make valid postgres queries.
const UserRepo = (postgres) => {
  //Setup the user table if it does not exist
  const createUserTableSQL = `
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      first_name text,
      last_name text,
      email text NOT NULL UNIQUE,
      passhash text NOT NULL,
      pic_url text,
      address_1 text,
      address_2 text,
      city text,
      state text,
      zip text,
      phone text,
      auth_token text,
      created_at timestamptz DEFAULT NOW()
    );`;

  // Uses createUserTableSQL to create the table, and logs the error.
  const setupRepo = async () => {
    try {
      const client = await postgres.connect();
      await client.query(createUserTableSQL);
      client.release();
      console.log('User Table Created');
      return null;
    } catch (err) {
      return err;
    }
  };

  // Inserts a user entry into the users table
  const createUserSQL = `
    INSERT INTO users(first_name, last_name, email, passhash, pic_url, address_1, address_2, city, state, zip, phone, auth_token)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;`;

  // Users createUserSQL and inserts a user into the users column. If we get an
  // error, then we return the (null, error), otherwise return (data, null)
  const createUser = async (first_name, last_name, email, passhash, pic_url, address_1, address_2, city, state, zip, phone, token) => {
    const values = [first_name, last_name, email, passhash, pic_url, address_1, address_2, city, state, zip, phone, token];
    try {
      const client = await postgres.connect();
      const res = await client.query(createUserSQL, values);
      client.release();
      return [res.rows[0], null];
    } catch (err) {
      return [null, err];
    }
  };

  // Retrieve the user id where the auth_token is given
  const getUserInfoByAuthTokenSQL = `
    SELECT * FROM users WHERE auth_token=$1;`;

  // Uses getUserIDByAuthTokenSQL to retrieve the user, and return either (user, null),
  // or (null, error)
  const getUserInfoByAuthToken = async (token) => {
    const values = [token];
    try {
      const client = await postgres.connect();
      const res = await client.query(getUserInfoByAuthTokenSQL, values);
      client.release();
      return [res.rows[0], null];
    } catch (err) {
      return [null, err];
    }
  };

  // Retrieve the user id where the email is given
  const getUserInfoByEmailSQL = `
    SELECT * FROM users WHERE email=$1;`;

  // Uses getUserInfoByEmailSQL to retrieve the user, and return either (user, null),
  // or (null, error)
  const getUserInfoByEmail = async (token) => {
    const values = [token];
    try {
      const client = await postgres.connect();
      const res = await client.query(getUserInfoByEmailSQL, values);
      client.release();
      return [res.rows[0], null];
    } catch (err) {
      return [null, err];
    }
  };

  // Retrieve abbreviated user fields from the user column by a user's id. This should
  // only ever return one user, since IDs should be unique
  const getOtherUserInfoSQL = `
    SELECT id, first_name, last_name, pic_url FROM users WHERE id=$1;`;

  // Uses getOtherUserInfoSQL to retrieve the user, and return either (user, null),
  // or (null, error)
  const getOtherUserInfo = async (id) => {
    const values = [id];
    try {
      const client = await postgres.connect();
      const res = await client.query(getOtherUserInfoSQL, values);
      client.release();
      return [res.rows[0], null];
    } catch (err) {
      return [null, err];
    }
  };

  return {
    setupRepo,
    createUser,
    getUserInfoByAuthToken,
    getUserInfoByEmail,
    getOtherUserInfo,
  };
};

module.exports = {
  UserRepo,
};