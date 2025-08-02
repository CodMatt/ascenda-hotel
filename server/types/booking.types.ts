export interface IBooking {
  id: string;
  dest_id: string;
  hotel_id: string;
  nights: number;
  start_date: string;
  end_date: string;
  adults: number;
  children: number;
  msg_to_hotel: string;
  price: number;
  user_ref: string | null;
  updated_at: Date;
  created: Date;
}

export interface ICreateBookingRequest {
  dest_id: string;
  hotel_id: string;
  nights?: number;
  start_date: string;
  end_date: string;
  adults?: number;
  children?: number;
  msg_to_hotel?: string;
  price?: number;
  user_ref?: string | null;
  // Guest booking fields (required when user_ref is null)
  first_name?: string;
  last_name?: string;
  salutation?: string;
  phone_num?: string;
  email?: string;
}

export interface INonAcct {
  booking_id: string;
  first_name: string;
  last_name: string;
  salutation: string;
  phone_num: string;
  email: string;
}