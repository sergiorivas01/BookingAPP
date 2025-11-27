import { Router, Request, Response } from 'express';
import {
  ClientService,
  CreateClientDTO,
  UpdateClientDTO,
} from '@azucar_1/bookingapp';

export function clientRoutes(clientService: ClientService): Router {
  const router = Router();

  /**
   * GET /api/clients
   * Get all clients
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const clients = await clientService.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error('Error getting clients:', error);
      res.status(500).json({
        error: 'Failed to get clients',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/clients/:id
   * Get a client by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = await clientService.getClient(id);

      if (!client) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.json(client);
    } catch (error) {
      console.error('Error getting client:', error);
      res.status(500).json({
        error: 'Failed to get client',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/clients
   * Create a new client
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const dto: CreateClientDTO = req.body;

      // Validate required fields
      if (!dto.name || !dto.email || !dto.phone) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Name, email, and phone are required',
        });
      }

      const client = await clientService.createClient(dto);
      res.status(201).json(client);
    } catch (error) {
      console.error('Error creating client:', error);
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        error: 'Failed to create client',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * PUT /api/clients/:id
   * Update a client
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dto: UpdateClientDTO = req.body;

      const client = await clientService.updateClient(id, dto);
      res.json(client);
    } catch (error) {
      console.error('Error updating client:', error);
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to update client',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * DELETE /api/clients/:id
   * Delete a client
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await clientService.deleteClient(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Client not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting client:', error);
      res.status(500).json({
        error: 'Failed to delete client',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

