import api from './api';
import { IBooking, ICreateBookingRequest } from '../types/booking.types';

export class BookingService {
  // Create booking (works for both authenticated and guest users)
  async createBooking(bookingData: ICreateBookingRequest): Promise<{ message: string; booking_id: string }> {
    const response = await api.post('/booking', bookingData);
    return response.data;
  }

  // Get all bookings (public)
  async getAllBookings(): Promise<IBooking[]> {
    const response = await api.get<IBooking[]>('/booking');
    return response.data;
  }

  // Get booking by ID (public)
  async getBookingById(id: string): Promise<IBooking> {
    const response = await api.get<IBooking>(`/booking/details/${id}`);
    return response.data;
  }

  // Get user's bookings (protected)
  async getUserBookings(): Promise<IBooking[]> {
    const response = await api.get<IBooking[]>('/booking/my-booking');
    return response.data;
  }

  // Get specific user booking (protected)
  async getUserBookingById(id: string): Promise<IBooking> {
    const response = await api.get<IBooking>(`/booking/my-booking/${id}`);
    return response.data;
  }

  // Update booking
  async updateBooking(id: string, updates: Partial<IBooking>): Promise<{ message: string; result: any }> {
    const response = await api.put(`/booking/update/${id}`, updates);
    return response.data;
  }

  // Delete booking (protected)
  async deleteBooking(id: string): Promise<{ message: string; result: any }> {
    const response = await api.delete(`/booking/${id}`);
    return response.data;
  }
}

export const bookingService = new BookingService();