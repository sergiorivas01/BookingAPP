import { useState, FormEvent, useEffect } from 'react';
import { CreateReservationDTO, Client } from '../../types/models';
import './ReservationForm.css';

interface ReservationFormProps {
  onSubmit: (data: CreateReservationDTO) => Promise<void>;
  onCancel: () => void;
  clients: Client[];
  isLoading?: boolean;
}

// Form data type with dates as strings for input fields
interface ReservationFormData {
  clientId: string;
  propertyId: string;
  date: string;
  endDate: string;
  time: string;
  numberOfGuests: number;
  notes: string;
}

function ReservationForm({ onSubmit, onCancel, clients, isLoading = false }: ReservationFormProps) {
  const [formData, setFormData] = useState<ReservationFormData>({
    clientId: '',
    propertyId: '',
    date: '',
    endDate: '',
    time: '',
    numberOfGuests: 1,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Set default time to current time
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    if (!formData.time) {
      setFormData((prev) => ({ ...prev, time: `${hours}:${minutes}` }));
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.date) {
      newErrors.date = 'Start date is required';
    } else {
      const date = new Date(formData.date);
      if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
        newErrors.date = 'Start date cannot be in the past';
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.date && formData.endDate <= formData.date) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    } else if (!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(formData.time)) {
      newErrors.time = 'Invalid time format (use HH:MM)';
    }

    if (!formData.numberOfGuests || formData.numberOfGuests <= 0) {
      newErrors.numberOfGuests = 'Number of guests must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const submitData: CreateReservationDTO = {
      ...formData,
      date: new Date(formData.date),
      endDate: new Date(formData.endDate),
      propertyId: formData.propertyId || undefined,
      notes: formData.notes || undefined,
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="reservation-form">
      <div className="form-group">
        <label htmlFor="clientId">
          Client <span className="required">*</span>
        </label>
        <select
          id="clientId"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          className={errors.clientId ? 'error' : ''}
          disabled={isLoading || clients.length === 0}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.email})
            </option>
          ))}
        </select>
        {errors.clientId && <span className="error-message">{errors.clientId}</span>}
        {clients.length === 0 && (
          <span className="error-message">No clients available. Please create a client first.</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="propertyId">Property ID (Optional)</label>
        <input
          type="text"
          id="propertyId"
          value={formData.propertyId}
          onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
          disabled={isLoading}
          placeholder="Enter property ID"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date">
            Start Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={errors.date ? 'error' : ''}
            disabled={isLoading}
            min={new Date().toISOString().split('T')[0]}
          />
          {errors.date && <span className="error-message">{errors.date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="endDate">
            End Date <span className="required">*</span>
          </label>
          <input
            type="date"
            id="endDate"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className={errors.endDate ? 'error' : ''}
            disabled={isLoading}
            min={formData.date ? formData.date : new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && <span className="error-message">{errors.endDate}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="time">
            Time <span className="required">*</span>
          </label>
          <input
            type="time"
            id="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            className={errors.time ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.time && <span className="error-message">{errors.time}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="numberOfGuests">
            Number of Guests <span className="required">*</span>
          </label>
          <input
            type="number"
            id="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={(e) =>
              setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })
            }
            className={errors.numberOfGuests ? 'error' : ''}
            disabled={isLoading}
            min="1"
          />
          {errors.numberOfGuests && (
            <span className="error-message">{errors.numberOfGuests}</span>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (Optional)</label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          disabled={isLoading}
          rows={3}
          placeholder="Additional notes about the reservation..."
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Reservation'}
        </button>
      </div>
    </form>
  );
}

export default ReservationForm;

