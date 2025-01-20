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

  /** Fetch MODULES filtered*/
  async getModulesFiltered(
    unitIds: number[],
    locationIds: number[],
  ): Promise<Module[]> {
    // if no unitIds and locationIds are provided, fetch all modules
    if (!unitIds?.length && !locationIds?.length) {
      return this.db.select().from(modules);
    }

    // fetch modules that have valid unitIds and locationIds
    return this.db
      .selectDistinct({ id: modules.id, title: modules.title })
      .from(modules)
      .innerJoin(moduleUnitMapping, eq(moduleUnitMapping.moduleId, modules.id))
      .innerJoin(
        unitLocationMapping,
        eq(unitLocationMapping.unitId, moduleUnitMapping.unitId),
      )
      .where(
        and(
          unitIds?.length
            ? inArray(moduleUnitMapping.unitId, unitIds)
            : sql`1=1`,
          locationIds?.length
            ? inArray(unitLocationMapping.locationId, locationIds)
            : sql`1=1`,
        ),
      );
  }

  /** Fetch UNITS filtered*/
  async getUnitsFiltered(
    moduleIds: number[],
    locationIds: number[],
  ): Promise<Unit[]> {
    // If no filters are provided, return all units
    if (!moduleIds?.length && !locationIds?.length) {
      return this.db.select().from(units);
    }

    // Query to fetch valid units based on moduleIds
    let validUnitIdsFromModules: number[] = [];
    if (moduleIds?.length) {
      const validUnitsForModules = await this.db
        .select({ unitId: moduleUnitMapping.unitId })
        .from(moduleUnitMapping)
        .where(inArray(moduleUnitMapping.moduleId, moduleIds));

      validUnitIdsFromModules = validUnitsForModules.map(u => u.unitId);
    }

    // Query to fetch valid units based on locationIds
    let validUnitIdsFromLocations: number[] = [];
    if (locationIds?.length) {
      const validUnitsForLocations = await this.db
        .select({ unitId: unitLocationMapping.unitId })
        .from(unitLocationMapping)
        .where(inArray(unitLocationMapping.locationId, locationIds));

      validUnitIdsFromLocations = validUnitsForLocations.map(u => u.unitId);
    }

    // Combine valid unit IDs from moduleIds and locationIds (intersection if both are provided)
    let validUnitIds: number[] = [];
    if (moduleIds?.length && locationIds?.length) {
      validUnitIds = validUnitIdsFromModules.filter(unitId =>
        validUnitIdsFromLocations.includes(unitId),
      );
    } else if (moduleIds?.length) {
      validUnitIds = validUnitIdsFromModules;
    } else if (locationIds?.length) {
      validUnitIds = validUnitIdsFromLocations;
    }

    // Fetch and return the units matching the valid unit IDs
    return this.db.select().from(units).where(inArray(units.id, validUnitIds));
  }

  /** Fetch LOCATIONS filtered*/
  async getLocationsFiltered(
    unitIds: number[],
    moduleIds: number[],
  ): Promise<Location[]> {
    // If no unitIds or moduleIds are provided, return all locations
    if (!unitIds?.length && !moduleIds?.length) {
      return this.db.select().from(locations);
    }

    // Query to fetch valid locations based on unitIds only
    let validLocationIdsFromUnits: number[] = [];
    if (unitIds?.length) {
      const validLocationsForUnits = await this.db
        .select({ locationId: unitLocationMapping.locationId })
        .from(unitLocationMapping)
        .where(inArray(unitLocationMapping.unitId, unitIds));

      validLocationIdsFromUnits = validLocationsForUnits.map(l => l.locationId);
    }

    // Query to fetch valid locations based on moduleIds only
    let validLocationIdsFromModules: number[] = [];
    if (moduleIds?.length) {
      const validUnitsForModules = await this.db
        .select({ unitId: moduleUnitMapping.unitId })
        .from(moduleUnitMapping)
        .where(inArray(moduleUnitMapping.moduleId, moduleIds));

      const validLocationsForModules = await this.db
        .select({ locationId: unitLocationMapping.locationId })
        .from(unitLocationMapping)
        .where(
          inArray(
            unitLocationMapping.unitId,
            validUnitsForModules.map(u => u.unitId),
          ),
        );

      validLocationIdsFromModules = validLocationsForModules.map(
        l => l.locationId,
      );
    }

    // Combine valid locations from unitIds and moduleIds if both are provided
    let validLocationIds: number[] = [];
    if (unitIds?.length && moduleIds?.length) {
      validLocationIds = validLocationIdsFromUnits.filter(locationId =>
        validLocationIdsFromModules.includes(locationId),
      );
    } else if (unitIds?.length) {
      validLocationIds = validLocationIdsFromUnits;
    } else if (moduleIds?.length) {
      validLocationIds = validLocationIdsFromModules;
    }

    // Fetch and return the locations that match the valid location IDs
    return this.db
      .select()
      .from(locations)
      .where(inArray(locations.id, validLocationIds));
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
