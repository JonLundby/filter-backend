import { and, eq, inArray, sql } from 'drizzle-orm';
import { Database } from '../types/database';
import {
  modules,
  units,
  locations,
  moduleUnitMapping,
  unitLocationMapping,
} from '../db/schema';
import { Module, Unit, Location } from '../types';

export class FilterRepository {
  constructor(private db: Database) {}

  /** Write you DB calls here */  
  /** Fetch all LOCATIONS*/
  async getAllLocations(): Promise<Location[]> {
    return this.db.select().from(locations);
  }
  
  /** Fetch all UNITS*/
  async getAllUnits(): Promise<Unit[]> {
    return this.db.select().from(units);
  }

  /** Fetch all MODULES*/
  async getAllModules(): Promise<Module[]> {
    return this.db.select().from(modules);
  }
  
  
  /** DO NOT TOUCH this DB call - it checks your provided filters combination and return whether it is valid or not */
  async validateFilterCombination(
    moduleIds: number[],
    unitIds: number[],
    locationIds: number[],
  ): Promise<boolean> {
    const validUnitsForModules = await this.db
      .select({ unitId: moduleUnitMapping.unitId })
      .from(moduleUnitMapping)
      .where(inArray(moduleUnitMapping.moduleId, moduleIds));

    const validUnitIds = validUnitsForModules.map(u => u.unitId);

    const areAllUnitsValid = unitIds.every(unitId =>
      validUnitIds.includes(unitId),
    );

    if (!areAllUnitsValid) return false;

    const validLocationsForUnits = await this.db
      .select({ locationId: unitLocationMapping.locationId })
      .from(unitLocationMapping)
      .where(inArray(unitLocationMapping.unitId, unitIds));

    const validLocationIds = validLocationsForUnits.map(l => l.locationId);

    const areAllLocationsValid = locationIds.every(locationId =>
      validLocationIds.includes(locationId),
    );

    return areAllLocationsValid;
  }
}
