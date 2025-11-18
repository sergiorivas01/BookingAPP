import { useState, useEffect } from 'react';
import { reservationApi, clientApi, ApiError } from '../../services/api';
import { Reservation, CreateReservationDTO, Client } from '../../types/models';
import Modal from '../../components/Modal/Modal';
import ReservationForm from '../../components/ReservationForm/ReservationForm';
import './Reservations.css';

function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reservationApi.getAll();
      setReservations(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load reservations. Please check if the API is running.');
      }
      console.error('Error loading reservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const data = await clientApi.getAll();
      setClients(data);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  useEffect(() => {
    loadReservations();
    loadClients();
  }, []);

  const handleCreateReservation = async (data: CreateReservationDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      await reservationApi.create(data);
      setIsModalOpen(false);
      await loadReservations();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create reservation');
      }
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reservations-page">
      <div className="page-header">
        <h1>Reservation Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Create Reservation
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="reservations-content">
        {isLoading && reservations.length === 0 ? (
          <div className="loading-state">
            <p>Loading reservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="empty-state">
            <p>No reservations found. Create your first reservation to get started.</p>
          </div>
        ) : (
          <div className="reservations-list">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Client ID</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td>{reservation.clientId.substring(0, 12)}...</td>
                    <td>{new Date(reservation.date).toLocaleDateString()}</td>
                    <td>{new Date(reservation.endDate).toLocaleDateString()}</td>
                    <td>{reservation.time}</td>
                    <td>{reservation.numberOfGuests}</td>
                    <td>
                      <span className={`status-badge status-${reservation.status}`}>
                        {reservation.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError(null);
        }}
        title="Create Reservation"
      >
        <ReservationForm
          onSubmit={handleCreateReservation}
          onCancel={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          clients={clients}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}

export default Reservations;

