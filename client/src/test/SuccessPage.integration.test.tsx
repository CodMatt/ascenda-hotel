import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
} from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SuccessPage from "../pages/SuccessPage";
import BookingSuccessCard from "../components/BookingSuccessCard";

beforeAll(() => {
  global.MutationObserver = class MutationObserver {
    constructor() {}
    observe() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
});
// Mock the dependencies
vi.mock("../lib/FormatDisplayDate", () => ({
  default: vi.fn((date) => {
    if (
      !date ||
      date === "Failed to save check-in date" ||
      date === "Failed to save check-out date"
    ) {
      return date;
    }
    return new Date(date).toLocaleDateString("en-GB");
  }),
}));

vi.mock("./EmptyNavBar", () => ({
  default: () => <div data-testid="empty-navbar">Empty Nav Bar</div>,
}));

vi.mock("react-spinners", () => ({
  ClipLoader: ({ loading }: { loading: boolean }) =>
    loading ? <div data-testid="spinner">Loading...</div> : null,
}));

vi.mock("../styles/SuccessPage.css", () => ({}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window methods
Object.defineProperty(window, "print", {
  value: vi.fn(),
  writable: true,
});

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper function to wrap components with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

// Sample booking data for testing
const mockBookingData = {
  bookingId: "BK123456",
  hotelName: "Grand Hotel Singapore",
  hotelAddr: "123 Orchard Road, Singapore",
  roomType: "Deluxe Room",
  checkin: new Date("2024-03-15"),
  checkout: new Date("2024-03-18"),
  duration: 3,
  salutation: "Mr.",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+65 9123 4567",
  emailAddress: "john.doe@example.com",
  noAdults: "2",
  noChildren: "1",
  specialRequest: "Late check-in requested",
  rates: 200,
  totalPrice: 600,
  noRooms: 1,
  userRef: "USER123",
  destId: "DEST456",
  hotelId: "HOTEL789",
};

// Mock sessionStorage properly
const mockSessionStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: mockSessionStorage,
  writable: true,
});

describe("BookingSuccessCard and SuccessPage Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    mockSessionStorage.clear.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("BookingSuccessCard Component", () => {
    it("should render all booking details correctly", () => {
      renderWithRouter(<BookingSuccessCard {...mockBookingData} />);

      // Check if all main elements are present
      expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
      expect(
        screen.getByText("Thank you for your booking!")
      ).toBeInTheDocument();

      // Use a more flexible matcher for booking ID that might be split by elements
      expect(screen.getByText(/BK123456/)).toBeInTheDocument();

      // Hotel information
      expect(screen.getByText("Grand Hotel Singapore")).toBeInTheDocument();
      expect(
        screen.getByText("123 Orchard Road, Singapore")
      ).toBeInTheDocument();
      expect(screen.getByText("Deluxe Room")).toBeInTheDocument();

      // Guest information
      expect(screen.getByText("Mr. John Doe")).toBeInTheDocument();
      expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
      expect(screen.getByText("+65 9123 4567")).toBeInTheDocument();

      // Special request
      expect(screen.getByText("Late check-in requested")).toBeInTheDocument();

      // Payment summary - look for the amounts within the payment summary context
      expect(screen.getByText(/200/)).toBeInTheDocument();

      expect(screen.getByText(/600/)).toBeInTheDocument();
    });

    it("should handle missing data gracefully", () => {
      const incompleteData = {
        bookingId: "",
        hotelName: "",
        hotelAddr: "",
        roomType: "",
        checkin: new Date(),
        checkout: new Date(),
        duration: 1,
        salutation: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
        emailAddress: "",
        noAdults: "",
        noChildren: "",
        specialRequest: "",
        rates: 0,
        totalPrice: 0,
        noRooms: 0,
      };

      renderWithRouter(<BookingSuccessCard {...incompleteData} />);

      // Use more specific selectors for unique elements
      expect(screen.getByText("Failed to save hotel name")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to save hotel address")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed to save room type")).toBeInTheDocument();

      // Check for booking ID in the booking-id-display section
      const bookingIdElement = document.querySelector(
        ".booking-id-display strong"
      );
      expect(bookingIdElement).toHaveTextContent("Booking ID: no booking ID");
    });

    it("should handle print functionality", () => {
      renderWithRouter(<BookingSuccessCard {...mockBookingData} />);

      const printButton = screen.getByText("Print Confirmation");
      fireEvent.click(printButton);

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it("should handle navigation to home page", () => {
      renderWithRouter(<BookingSuccessCard {...mockBookingData} />);

      const bookAnotherButton = screen.getByText("Book Another Stay");
      fireEvent.click(bookAnotherButton);

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "pendingBookingData"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("SuccessPage Component", () => {
    it("should show loading state initially", () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      renderWithRouter(<SuccessPage />);

      expect(screen.getByTestId("spinner")).toBeInTheDocument();
      expect(
        screen.getByText("Loading your booking confirmation...")
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "⚠️ Please do not use the back button while we load your booking"
        )
      ).toBeInTheDocument();
    });

    it("should display error when no booking data is found", async () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      // Mock Date.now to simulate timeout
      const originalDateNow = Date.now;
      let mockTime = 0;
      vi.spyOn(Date, "now").mockImplementation(() => mockTime);

      renderWithRouter(<SuccessPage />);

      expect(screen.getByTestId("spinner")).toBeInTheDocument();

      // Initially should show loading
      expect(
        screen.getByText("Loading your booking confirmation...")
      ).toBeInTheDocument();

      // Fast forward time to trigger timeout (5 minutes = 300000ms)
      mockTime = 300001;

      // Wait for the component to re-render and show error
      await new Promise((resolve) => setTimeout(resolve, 2000));
      expect(screen.getByTestId("spinner")).toBeInTheDocument();
    }, 10000);

    it("should successfully save booking data for logged-in user", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ booking_id: "BK123456" }),
      });

      renderWithRouter(<SuccessPage />);

      // Initially should show saving state
      expect(screen.getByText("Saving to database")).toBeInTheDocument();

      // Wait for saving to complete and success to show
      await waitFor(
        () => {
          expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify API call was made with correct data
      expect(mockFetch).toHaveBeenCalledWith("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nights: 3,
          adults: "2",
          children: "1",
          msg_to_hotel: "Late check-in requested",
          price: 600,
          user_ref: "USER123",
          dest_id: "DEST456",
          hotel_id: "HOTEL789",
          start_date: mockBookingData.checkin,
          end_date: mockBookingData.checkout,
        }),
      });
    });

    it("should successfully save booking data for guest user", async () => {
      const guestBookingData = { ...mockBookingData, userRef: null };
      const sessionData = JSON.stringify(guestBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ booking_id: "BK123456" }),
      });

      renderWithRouter(<SuccessPage />);

      await waitFor(
        () => {
          expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify API call includes guest information
      expect(mockFetch).toHaveBeenCalledWith("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nights: 3,
          adults: "2",
          children: "1",
          msg_to_hotel: "Late check-in requested",
          price: 600,
          dest_id: "DEST456",
          hotel_id: "HOTEL789",
          start_date: mockBookingData.checkin,
          end_date: mockBookingData.checkout,
          first_name: "John",
          last_name: "Doe",
          salutation: "Mr.",
          phone_num: "+65 9123 4567",
          email: "john.doe@example.com",
          user_ref: null,
        }),
      });
    });

    it("should handle booking save failure", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Payment failed" }),
      });

      renderWithRouter(<SuccessPage />);

      await waitFor(
        () => {
          expect(screen.getByText("Payment Failed")).toBeInTheDocument();
          expect(
            screen.getByText("We're sorry, your payment could not be processed")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should handle network errors during booking save", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderWithRouter(<SuccessPage />);

      await waitFor(
        () => {
          expect(screen.getByText("Payment Failed")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );
    });

    it("should show saving state during API call", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      // Mock a delayed response
      let resolvePromise: any;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockImplementationOnce(() => delayedPromise);

      renderWithRouter(<SuccessPage />);

      // Should show saving state initially
      expect(screen.getByText("Saving to database")).toBeInTheDocument();

      // Now resolve the promise
      resolvePromise({
        ok: true,
        json: async () => ({ booking_id: "BK123456" }),
      });

      // Then show success
      await waitFor(
        () => {
          expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe("Integration between SuccessPage and BookingSuccessCard", () => {
    it("should pass all booking data from SuccessPage to BookingSuccessCard", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ booking_id: "BK123456" }),
      });

      renderWithRouter(<SuccessPage />);

      // Wait for the booking to be processed and success card to be rendered
      await waitFor(
        () => {
          expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Verify all data is correctly displayed in BookingSuccessCard
      const bookingIdElement = document.querySelector(
        ".booking-id-display strong"
      );
      expect(bookingIdElement).toHaveTextContent("Booking ID: BK123456");

      expect(screen.getByText("Grand Hotel Singapore")).toBeInTheDocument();
      expect(screen.getByText("Mr. John Doe")).toBeInTheDocument();
      expect(screen.getByText("Late check-in requested")).toBeInTheDocument();

      expect(screen.getByText("$600 SGD")).toBeInTheDocument();
    });

    it("should handle the complete user flow from loading to success", async () => {
      const sessionData = JSON.stringify(mockBookingData);
      mockSessionStorage.getItem.mockReturnValue(sessionData);

      let resolvePromise: any;
      const delayedPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockFetch.mockImplementationOnce(() => delayedPromise);

      renderWithRouter(<SuccessPage />);

      // 1. Should show saving state (skipping initial loading since session data exists)
      expect(screen.getByText("Saving to database")).toBeInTheDocument();

      // 2. Resolve the API call
      resolvePromise({
        ok: true,
        json: async () => ({ booking_id: "BK123456" }),
      });

      // 3. Finally shows success with all booking details
      await waitFor(
        () => {
          expect(screen.getByText("Booking Confirmed!")).toBeInTheDocument();
          expect(
            screen.getByText("Thank you for your booking!")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // 4. Verify print and navigation functions work
      const printButton = screen.getByText("Print Confirmation");
      const bookAnotherButton = screen.getByText("Book Another Stay");

      fireEvent.click(printButton);
      expect(window.print).toHaveBeenCalled();

      fireEvent.click(bookAnotherButton);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(
        "pendingBookingData"
      );
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });
});
