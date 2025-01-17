import { Request, Response } from 'express';
import { FilterRepository } from '../repositories/filterRepository';
import {
  FilterValidationBody,
  ModuleResponse,
  UnitResponse,
  LocationResponse,
  ValidationResponse,
} from '../types';

export class FilterHandler {
  constructor(private repository: FilterRepository) {}

  /** HERE, you should write handlers to get modules, units and locations
   * BE AWARE, they are inter-dependent which means some units have certain modules and some locations have multiple units
   */

  /** GET all LOCATIONS - '/api/filters/locations' */
  getLocations = async (req: Request, res: Response<LocationResponse>) => {
    try {
      const allLocations = await this.repository.getAllLocations();
      res.json({
        locations: allLocations,
      });
    } catch (error) {
      console.error('Error fetching locations:', error);
      res.status(500).json({ locations: [] });
    }
  };

  /** GET all UNITS - '/api/filters/units' */
  getUnits = async (req: Request, res: Response<UnitResponse>) => {
    try {
      const allUnits = await this.repository.getAllUnits();

      res.json({
        units: allUnits,
      });
    } catch (error) {
      console.error('Error fetching units:', error);
      res.status(500).json({ units: [] });
    }
  };

  /** GET all MODULES'/api/filters/modules' */
  getModules = async (req: Request, res: Response<ModuleResponse>) => {
    try {
      const allModules = await this.repository.getAllModules();
      res.json({
        modules: allModules,
      });
    } catch (error) {
      console.error('Error fetching modules:', error);
      res.status(500).json({ modules: [] });
    }
  };
  

  /** DO NOT CHANGE THIS HANDLER - this one checks you provided body payload of selected filters */
  validateFilters = async (
    req: Request,
    res: Response<ValidationResponse>,
  ): Promise<void> => {
    try {
      const { moduleIds, unitIds, locationIds } =
        req.body as FilterValidationBody;

      if (!moduleIds?.length || !unitIds?.length || !locationIds?.length) {
        res.status(400).json({
          valid: false,
          errors: [
            'All filter arrays (moduleIds, unitIds, locationIds) are required and must not be empty',
          ],
        });
        return;
      }

      const isValid = await this.repository.validateFilterCombination(
        moduleIds,
        unitIds,
        locationIds,
      );

      if (!isValid) {
        res.json({
          valid: false,
          errors: ['The selected combination of filters is not valid'],
        });
        return;
      }

      res.json({ valid: true });
    } catch (error) {
      console.error('Error validating filters:', error);
      res.status(500).json({
        valid: false,
        errors: ['An error occurred while validating filters'],
      });
    }
  };
}
