const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'QuanLyYeuCauMoLop.sql');
const outputFile = path.join(__dirname, 'QuanLyYeuCauMoLop_Postgres.sql');

try {
  let sql = fs.readFileSync(inputFile, 'utf8');

  // 1. Remove USE Database
  sql = sql.replace(/^CREATE DATABASE .*;$/gm, '');
  sql = sql.replace(/^USE .*;$/gm, '');

  // 2. Convert ENUM to TEXT CHECK
  // Finds: columnName ENUM('val1', 'val2') 
  // Replaces: columnName TEXT CHECK (columnName IN ('val1', 'val2'))
  // Need a function to capture the column name and the values
  const enumRegex = /(\w+)\s+ENUM\((.*?)\)/g;
  sql = sql.replace(enumRegex, (match, colName, values) => {
    return `${colName} TEXT CHECK (${colName} IN (${values}))`;
  });

  // 3. Convert BIT to BOOLEAN
  sql = sql.replace(/\s+BIT\s+/g, ' BOOLEAN ');

  // 4. Convert ALTER TABLE MODIFY
  // MySQL: ALTER TABLE ThoiKhoaBieu MODIFY maTKB VARCHAR(50);
  // Postgres: ALTER TABLE ThoiKhoaBieu ALTER COLUMN maTKB TYPE VARCHAR(50);
  const modifyRegex = /ALTER TABLE (\w+) MODIFY (\w+) (.*?);/g;
  sql = sql.replace(modifyRegex, (match, tableName, colName, newType) => {
    return `ALTER TABLE ${tableName} ALTER COLUMN ${colName} TYPE ${newType};`;
  });

  // 5. If there are any backticks, convert to quotes (though this file seems not to have them, just in case)
  sql = sql.replace(/`/g, '"');
  
  // 6. Convert DATETIME to TIMESTAMP
  sql = sql.replace(/\s+DATETIME\s*/g, ' TIMESTAMP ');
  
  // 7. Fix DEFAULT Values for BOOLEAN if any (0/1 to false/true)
  // Not strictly necessary as Postgres accepts '0' and '1' for boolean sometimes, but better to be safe.

  fs.writeFileSync(outputFile, sql);
  console.log('Successfully converted SQL file to Postgres format: QuanLyYeuCauMoLop_Postgres.sql');
} catch (error) {
  console.error('Error during conversion:', error);
}
