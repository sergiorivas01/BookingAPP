import { Router, Request, Response } from 'express';
import { IStorage } from '../../../bookingapp-lib/storage/Storage';

export function propertyRoutes(storage: IStorage): Router {
  const router = Router();

  /**
   * GET /api/properties
   * Get all properties
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const properties = await storage.getAllProperties();
      res.json(properties);
    } catch (error) {
      console.error('Error getting properties:', error);
      res.status(500).json({
        error: 'Failed to get properties',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/properties/:id
   * Get a property by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const property = await storage.getProperty(id);

      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }

      res.json(property);
    } catch (error) {
      console.error('Error getting property:', error);
      res.status(500).json({
        error: 'Failed to get property',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

