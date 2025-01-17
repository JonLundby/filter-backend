import express, { Router } from 'express';
import { FilterHandler } from '../handlers/filterHandler';

export const createFilterRouter = (filterHandler: FilterHandler): Router => {
  const router = Router();

  /** Write you routes here*/
  // GET LOCATIONS - '/api/filters/locations'
  router.get('/locations', filterHandler.getLocations);

  // GET UNITS - '/api/filters/units'
  router.get('/units', filterHandler.getUnits);

  // GET MODULES - '/api/filters/modules'
  router.get('/modules', filterHandler.getModules);

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
