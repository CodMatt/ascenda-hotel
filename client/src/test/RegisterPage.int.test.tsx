import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../pages/RegisterPage";
import { MemoryRouter } from "react-router-dom";


// NOTE: Added testId for all without labels/placeholder - to be removed if deployed
// Mock AuthContext
const signupMock = vi.fn().mockResolvedValue({ ok: true });

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({
    signup: signupMock,
  }),
}));



describe("RegisterPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("submits the form successfully with valid inputs", async () => {

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "ValidPass1");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "John");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Doe");
    await userEvent.type(screen.getByPlaceholderText("Phone Number"), "12345678");

    // Select country and salutation
    await userEvent.selectOptions(screen.getByTestId("country-select"), "Singapore");
    await userEvent.selectOptions(screen.getByTestId("salutation-select"), "Mr");

    // Submit
    userEvent.click(screen.getByText("Create Account"));

    // Wait for success
    await waitFor(() => {
      expect(signupMock).toHaveBeenCalled();
      expect(screen.getByText(/Creating Account.../i)).toBeInTheDocument();
    });

  });

  it("submit the form with all invalid typed fields invalid to check invalid error", async () => {

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("Email"), "test");
    await userEvent.type(screen.getByPlaceholderText("Password"), "invalid");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "John1");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), " Doe");
    await userEvent.type(screen.getByPlaceholderText("Phone Number"), "123 45678");

    // Select country and salutation
    await userEvent.selectOptions(screen.getByTestId("country-select"), "Singapore");
    await userEvent.selectOptions(screen.getByTestId("salutation-select"), "Mr");

    // Submit
    userEvent.click(screen.getByText("Create Account"));

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText(/Missing/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid First Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid Last Name/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid Email Address/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid Password/i)).toBeInTheDocument();
    });

  });

  it("submit the form with invalid first name and phone number to check invalid error", async () => {

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    // Fill the form
    await userEvent.type(screen.getByPlaceholderText("Email"), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("Password"), "ValidPass1");
    await userEvent.type(screen.getByPlaceholderText("First Name"), "John1");
    await userEvent.type(screen.getByPlaceholderText("Last Name"), "Doe");
    await userEvent.type(screen.getByPlaceholderText("Phone Number"), "1234a5678");

    // Select country and salutation
    await userEvent.selectOptions(screen.getByTestId("country-select"), "Singapore");
    await userEvent.selectOptions(screen.getByTestId("salutation-select"), "Mr");

    // Submit
    userEvent.click(screen.getByText("Create Account"));

    // Wait for success
    await waitFor(() => {
      expect(screen.getByText(/Missing/i)).toBeInTheDocument();
      expect(screen.getByText(/Invalid First Name/i)).toBeInTheDocument();
    });

  });
});