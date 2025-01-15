import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
/** This is Drizzle ORM schema that represents our DB tables structure.
 * Investigate it cause it will be helpful for you to understand our DB structure
 */

// The table for mapping units to locations
export const unitLocationMapping = sqliteTable('unit_locations', {
  unitId: integer('unit_id'),
  locationId: integer('location_id'),
});

// The table for mapping modules to units
export const moduleUnitMapping = sqliteTable('module_units', {
  moduleId: integer('module_id'),
  unitId: integer('unit_id'),
});

// The locations/units table
export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey(),
  name: text('name'),
});

// The units table
export const units = sqliteTable('units', {
  id: integer('id').primaryKey(),
  name: text('name'),
});

// The modules table
export const modules = sqliteTable('modules', {
  id: integer('id').primaryKey(),
  title: text('title'),
});
