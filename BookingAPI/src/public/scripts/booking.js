document.addEventListener('DOMContentLoaded', function() {
    // Initialize date pickers
    flatpickr(".datepicker", {
        dateFormat: "Y-m-d",
        minDate: "today"
    });
    
    // Calculate end date based on start date and nights
    document.getElementById('nights').addEventListener('change', updateEndDate);
    document.getElementById('start-date').addEventListener('change', updateEndDate);
    
    // Load all bookings on page load
    loadAllBookings();
    
    // Form submission handler
    document.getElementById('booking-form').addEventListener('submit', function(e) {
        e.preventDefault();
        submitBooking();
    });
    
    // Cancel button handler
    document.getElementById('cancel-btn').addEventListener('click', function() {
        resetForm();
    });
});

function updateEndDate() {
    const startDate = document.getElementById('start-date').value;
    const nights = parseInt(document.getElementById('nights').value);
    
    if (startDate && nights) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + nights);
        
        // Format as YYYY-MM-DD
        const endStr = end.toISOString().split('T')[0];
        document.getElementById('end-date').value = endStr;
    }
}

async function loadAllBookings() {
    try {
        const response = await fetch('/api/booking');

        const bookings = await response.json();
        console.log(JSON.stringify(bookings));
        if (!response.ok) throw new Error('Failed to fetch bookings');
        renderBookingsTable(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Failed to load bookings. Please try again.');
    }
}

function renderBookingsTable(bookings) {
    const container = document.getElementById('all-bookings-anchor');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p>No bookings found</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Booking Ref</th>
                    <th>Destination</th>
                    <th>Hotel</th>
                    <th>Dates</th>
                    <th>Guests</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(booking => `
                    <tr>
                        <td>${booking.booking_reference}</td>
                        <td>${booking.destination_id}</td>
                        <td>${booking.hotel_id}</td>
                        <td>${formatDate(booking.start_date)} to ${formatDate(booking.end_date)} (${booking.nights} nights)</td>
                        <td>${booking.adults} adults, ${booking.children || 0} children</td>
                        <td>$${parseFloat(booking.price).toFixed(2)}</td>
                        <td>
                            <button class="btn btn-sm btn-primary edit-booking-btn" data-booking-id="${booking.booking_id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-booking-btn" data-booking-id="${booking.booking_id}">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-booking-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            editBooking(bookingId);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-booking-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            if (confirm('Are you sure you want to delete this booking?')) {
                deleteBooking(bookingId);
            }
        });
    });
}

async function editBooking(bookingId) {
    try {
        const response = await fetch(`/api/booking/${bookingId}`);
        if (!response.ok) throw new Error('Failed to fetch booking');
        
        const booking = await response.json();
        populateForm(booking);
        
        // Scroll to form
        document.getElementById('booking-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading booking:', error);
        alert('Failed to load booking details. Please try again.');
    }
}

function populateForm(booking) {
    document.getElementById('booking-id').value = booking.booking_id;
    document.getElementById('destination-id').value = booking.destination_id;
    document.getElementById('hotel-id').value = booking.hotel_id;
    document.getElementById('nights').value = booking.nights;
    document.getElementById('start-date').value = booking.start_date;
    document.getElementById('end-date').value = booking.end_date;
    document.getElementById('adults').value = booking.adults;
    document.getElementById('children').value = booking.children || 0;
    document.getElementById('msg-to-hotel').value = booking.msg_to_hotel || '';
    document.getElementById('price').value = booking.price;
    document.getElementById('booking-reference').value = booking.booking_reference;
}

async function submitBooking() {
    const bookingId = document.getElementById('booking-id').value;
    const formData = {
        dest_id: document.getElementById('destination-id').value,
        hotel_id: document.getElementById('hotel-id').value,
        nights: parseInt(document.getElementById('nights').value),
        start_date: document.getElementById('start-date').value,
        end_date: document.getElementById('end-date').value,
        adults: parseInt(document.getElementById('adults').value),
        children: parseInt(document.getElementById('children').value) || 0,
        msg_to_hotel: document.getElementById('msg-to-hotel').value,
        price: parseFloat(document.getElementById('price').value),
        booking_ref: document.getElementById('booking-reference').value
    };

    // Generate ID if new booking
    if (!bookingId) {
        formData.id = `booking-${Date.now()}`;
    }

    try {
        const method = bookingId ? 'PUT' : 'POST';
        const url = bookingId ? `/api/booking/${bookingId}` : '/api/booking';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to save booking');
        
        resetForm();
        loadAllBookings();
        alert('Booking saved successfully!');
    } catch (error) {
        console.error('Error saving booking:', error);
        alert('Failed to save booking. Please try again.');
    }
}

async function deleteBooking(bookingId) {
    try {
        const response = await fetch(`/api/booking/${bookingId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete booking');
        
        loadAllBookings();
        alert('Booking deleted successfully!');
    } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Failed to delete booking. Please try again.');
    }
}

function resetForm() {
    document.getElementById('booking-form').reset();
    document.getElementById('booking-id').value = '';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}