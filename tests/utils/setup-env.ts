export default () => {
  process.env.NODE_ENV = 'test';
  process.env.APP_PORT = '3000';
  process.env.APP_HOST = 'localhost';
  process.env.APP_NAME = 'api_service_test';
  process.env.JWT_SECRET_KEY = '142ac94e27fc79b82966768514109d70341f3bcf21219df8407f71aa21c71869';
  //JWT_PRIVATE_KEY_PATH=./tests/keys/private.key
  //JWT_PUBLIC_KEY_PATH=./tests/keys/public.key
  process.env.AUTO_MIGRATE = 'true';
  process.env.MIGRATIONS_TABLE = 'pgmigrations';
  process.env.MIGRATIONS_DIR = './migrations';
};
