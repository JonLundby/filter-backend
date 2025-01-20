import express, { Router } from 'express';
import { FilterHandler } from '../handlers/filterHandler';

export const createFilterRouter = (filterHandler: FilterHandler): Router => {
  const router = Router();

  /** Write you routes here*/
  // GET MODULES - ex: '/api/filters/modules' or 'api/filters/modules?unitIds=2&locationIds='
  router.get('/modules', filterHandler.getModules);

  // GET UNITS - ex: '/api/filters/units' or 'api/filters/units?moduleIds=2&locationIds=1'
  router.get('/units', filterHandler.getFilteredUnits);

  // GET LOCATIONS - ex: '/api/filters/locations' or 'api/filters/locations?unitIds=2&moduleIds=1'
  router.get('/locations', filterHandler.getFilteredLocations);

  /** DO NOT TOUCH THIS ROUTE - it checks your body payload to validate whether you fetched correct filters
 * body payload type --> 
 * export interface FilterValidationRequest {
    moduleIds: number[];
    unitIds: number[];
    locationIds: number[];
   }
*/
  router.post('/validate', filterHandler.validateFilters);

  return router;
};
