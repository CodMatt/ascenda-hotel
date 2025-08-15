import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import GuestInfoPage from "../pages/GuestInfoPage";
import { MemoryRouter } from "react-router-dom";

import { waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


const checkin = new Date("2025-08-20");
const checkout = new Date("2025-08-22")
// Function to create state data
const createState = (overrides = {}) => ({

  hotelId: "H1",
  destId: "D1",
  hotelName: "Test Hotel",
  hotelAddr: "123 Test Street",
  key: "booking-key",
  rates: 200,
  checkin: checkin,
  checkout: checkout,
  noAdults: 2,
  noChildren: 0,
  noNights: 2,
  totalPrice: 400,
  noRooms: 1,
  authToken: "", // overridden for logged-in case
  firstName: "",
  lastName: "",
  salutation: "",
  phoneNumber: "",
  emailAddress: "",
  country: "",
  countryCode: "",
  userRef: "U1",
  roomType: "Deluxe",
  ...overrides,
});

// Mock useLocation from react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useLocation: vi.fn(),
    useNavigate: () => vi.fn(),
  };
});

import { useLocation } from "react-router-dom";


describe("GuestInfoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders EmptyNavBar at the top of the page", () => {
  (useLocation as Mock).mockReturnValue({
    state: createState({ authToken: "" }), // or logged-in, doesn't matter
  });

  render(
    <MemoryRouter>
      <GuestInfoPage />
    </MemoryRouter>
  );

  // Check that EmptyNavBar appears
  // Example: if it renders a logo with alt="Ascenda logo"
  expect(screen.getByAltText("Ascenda logo")).toBeInTheDocument();

});

  it("renders common elements for logged-in user", () => {
    (useLocation as Mock).mockReturnValue({
      state: createState({
        authToken: "valid-token",
        firstName: "John",
        lastName: "Doe",
        salutation: "Mr",
        phoneNumber: "65 123456789",
        emailAddress: "john@example.com",
      }),
    });

    render(
      <MemoryRouter>
        <GuestInfoPage />
      </MemoryRouter>
    );

    // Common elements
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Enter Personal Information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Proceed to Payment/i })
    ).toBeInTheDocument();

    // BookingSummary appears
    expect(screen.getByRole("heading", { name: /Booking Summary/i })).toBeInTheDocument();
    expect(screen.getByText(/Test Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/123 Test Street/)).toBeInTheDocument();
    expect(screen.getByText(/Check-in:/i)).toBeInTheDocument();
    expect(screen.getByText(/Check-out:/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
    expect(screen.getByText(/Adults:/i)).toBeInTheDocument();
    expect(screen.getByText(/No. Rooms:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$400 SGD/i)).toBeInTheDocument();

    // Logged-in section
    expect(screen.getByText(/Your Information/)).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Mr")).toBeInTheDocument();
    expect(screen.getByText("65 123456789")).toBeInTheDocument();
  });

  it("renders common elements for not logged-in user", () => {
    (useLocation as Mock).mockReturnValue({
      state: createState({
        authToken: "", // no login
      }),
    });

    render(
      <MemoryRouter>
        <GuestInfoPage />
      </MemoryRouter>
    );

    // Common elements
    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Enter Personal Information/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Proceed to Payment/i })
    ).toBeInTheDocument();

    // BookingSummary appears
    expect(screen.getByRole("heading", { name: /Booking Summary/i })).toBeInTheDocument();
    expect(screen.getByText(/Test Hotel/)).toBeInTheDocument();
    expect(screen.getByText(/123 Test Street/)).toBeInTheDocument();
    expect(screen.getByText(/Check-in:/i)).toBeInTheDocument();
    expect(screen.getByText(/Check-out:/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration:/i)).toBeInTheDocument();
    expect(screen.getByText(/Adults:/i)).toBeInTheDocument();
    expect(screen.getByText(/No. Rooms:/i)).toBeInTheDocument();
    expect(screen.getByText(/Total: \$400 SGD/i)).toBeInTheDocument();

    // Not-logged-in fields
    expect(screen.getByLabelText(/Salutation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();

  });

    it("renders submits form and shows no errors with invalid inputs", async () => {
    (useLocation as Mock).mockReturnValue({
      state: createState({
        authToken: "", // no login
      }),
    });

    render(
      <MemoryRouter>
        <GuestInfoPage />
      </MemoryRouter>
    );

    // Select country and salutation
    await userEvent.selectOptions(screen.getByLabelText("Country"), "Singapore");
    await userEvent.selectOptions(screen.getByLabelText("Salutation"), "Mrs");

    await userEvent.type(screen.getByPlaceholderText("Email Address"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "John");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Doe");
    await userEvent.type(screen.getByPlaceholderText("Phone Number"), "12345678");

    // Submit
    userEvent.click(screen.getByText("Proceed to Payment"));

    expect(screen.queryByText(/Invalid/i)).not.toBeInTheDocument();
  });

  it("renders submits form and renders error with invalid inputs", async () => {
    (useLocation as Mock).mockReturnValue({
      state: createState({
        authToken: "", // no login
      }),
    });

    render(
      <MemoryRouter>
        <GuestInfoPage />
      </MemoryRouter>
    );

    // Select country and salutation
    await userEvent.selectOptions(screen.getByLabelText("Country"), "Singapore");
    await userEvent.selectOptions(screen.getByLabelText("Salutation"), "Mrs");

    await userEvent.type(screen.getByPlaceholderText("Email Address"), "te1st@example.com");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "John");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Doe");
    await userEvent.type(screen.getByPlaceholderText("Phone Number"), "12345678a");

    // Submit
    userEvent.click(screen.getByText("Proceed to Payment"));

    await waitFor(() => {
      expect(screen.queryByText(/Invalid/i)).toBeInTheDocument();
    });
    
  });

});