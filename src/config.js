module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL ||
    'postgresql://admin:admin1234@localhost/baby_book',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'postgresql://admin:admin1234@localhost/baby_book_test',
};
