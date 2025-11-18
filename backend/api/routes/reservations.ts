import { Router, Request, Response } from 'express';
import { ReservationService } from '../../../bookingapp-lib/services/ReservationService';
import { ClientService } from '../../../bookingapp-lib/services/ClientService';
import { CreateReservationDTO, UpdateReservationDTO } from '../../../bookingapp-lib/models/Reservation';

export function reservationRoutes(
  reservationService: ReservationService,
  clientService: ClientService
): Router {
  const router = Router();

  /**
   * GET /api/reservations
   * Get all reservations
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const reservations = await reservationService.getAllReservations();
      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations:', error);
      res.status(500).json({
        error: 'Failed to get reservations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/reservations/:id
   * Get a reservation by ID
   */
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reservation = await reservationService.getReservation(id);

      if (!reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(reservation);
    } catch (error) {
      console.error('Error getting reservation:', error);
      res.status(500).json({
        error: 'Failed to get reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/reservations/:id/with-client
   * Get a reservation with client information
   */
  router.get('/:id/with-client', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const result = await reservationService.getReservationWithClient(id);

      if (!result.reservation) {
        return res.status(404).json({ error: 'Reservation not found' });
      }

      res.json(result);
    } catch (error) {
      console.error('Error getting reservation with client:', error);
      res.status(500).json({
        error: 'Failed to get reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/reservations/client/:clientId
   * Get reservations by client ID
   */
  router.get('/client/:clientId', async (req: Request, res: Response) => {
    try {
      const { clientId } = req.params;
      const reservations = await reservationService.getReservationsByClient(clientId);
      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations by client:', error);
      res.status(500).json({
        error: 'Failed to get reservations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/reservations/property/:propertyId
   * Get reservations by property ID
   */
  router.get('/property/:propertyId', async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const reservations = await reservationService.getReservationsByProperty(propertyId);
      res.json(reservations);
    } catch (error) {
      console.error('Error getting reservations by property:', error);
      res.status(500).json({
        error: 'Failed to get reservations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * GET /api/reservations/property/:propertyId/with-clients
   * Get property reservations with client information
   */
  router.get('/property/:propertyId/with-clients', async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const reservations = await reservationService.getPropertyReservationsWithClients(propertyId);
      res.json(reservations);
    } catch (error) {
      console.error('Error getting property reservations with clients:', error);
      res.status(500).json({
        error: 'Failed to get reservations',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/reservations
   * Create a new reservation
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const dto: CreateReservationDTO = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      // Validate required fields
      if (!dto.clientId || !dto.date || !dto.endDate || !dto.time || !dto.numberOfGuests) {
        return res.status(400).json({
          error: 'Validation error',
          message: 'Client ID, dates, time, and number of guests are required',
        });
      }

      const reservation = await reservationService.createReservation(dto);
      res.status(201).json(reservation);
    } catch (error) {
      console.error('Error creating reservation:', error);
      const statusCode =
        error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to create reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * PUT /api/reservations/:id
   * Update a reservation
   */
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const dto: UpdateReservationDTO = {
        ...req.body,
        date: req.body.date ? new Date(req.body.date) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
      };

      const reservation = await reservationService.updateReservation(id, dto);
      res.json(reservation);
    } catch (error) {
      console.error('Error updating reservation:', error);
      const statusCode =
        error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to update reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/reservations/:id/confirm
   * Confirm a reservation
   */
  router.post('/:id/confirm', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reservation = await reservationService.confirmReservation(id);
      res.json(reservation);
    } catch (error) {
      console.error('Error confirming reservation:', error);
      const statusCode =
        error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to confirm reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * POST /api/reservations/:id/cancel
   * Cancel a reservation
   */
  router.post('/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const reservation = await reservationService.cancelReservation(id);
      res.json(reservation);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      const statusCode =
        error instanceof Error && error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        error: 'Failed to cancel reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  /**
   * DELETE /api/reservations/:id
   * Delete a reservation
   */
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await reservationService.deleteReservation(id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting reservation:', error);
      res.status(500).json({
        error: 'Failed to delete reservation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

