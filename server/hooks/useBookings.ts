import { useState, useEffect } from 'react';
import { IBooking } from '../types/booking.types';
import { bookingService } from '../services/bookingServices';
import { useAuth } from '../contexts/AuthContext';

export const useBookings = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchUserBookings = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    try {
      const userBookings = await bookingService.getUserBookings();
      setBookings(userBookings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: any) => {
    try {
      await bookingService.createBooking(bookingData);
      if (isAuthenticated) {
        fetchUserBookings(); // Refresh user bookings
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteBooking = async (bookingId: string) => {
    try {
      await bookingService.deleteBooking(bookingId);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [isAuthenticated]);

  return {
    bookings,
    loading,
    error,
    createBooking,
    deleteBooking,
    refetch: fetchUserBookings,
  };
};