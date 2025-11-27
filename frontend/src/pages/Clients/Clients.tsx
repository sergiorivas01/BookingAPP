import { useState, useEffect } from 'react';
import { clientApi, ApiError } from '../../services/api';
import type { Client, CreateClientDTO } from '@azucar_1/bookingapp';
import Modal from '../../components/Modal/Modal';
import ClientForm from '../../components/ClientForm/ClientForm';
import './Clients.css';

function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientApi.getAll();
      setClients(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load clients. Please check if the API is running.');
      }
      console.error('Error loading clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleCreateClient = async (data: CreateClientDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      await clientApi.create(data);
      setIsModalOpen(false);
      await loadClients();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create client');
      }
      throw err; // Re-throw to let form handle it
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="clients-page">
      <div className="page-header">
        <h1>Client Management</h1>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          Add New Client
        </button>
      </div>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="clients-content">
        {isLoading && clients.length === 0 ? (
          <div className="loading-state">
            <p>Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients found. Create your first client to get started.</p>
          </div>
        ) : (
          <div className="clients-list">
            <table className="clients-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>
                      {new Date(client.createdAt).toLocaleDateString()}
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
        title="Add New Client"
      >
        <ClientForm
          onSubmit={handleCreateClient}
          onCancel={() => {
            setIsModalOpen(false);
            setError(null);
          }}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}

export default Clients;

