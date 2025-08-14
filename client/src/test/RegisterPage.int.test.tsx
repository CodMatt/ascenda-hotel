import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "../pages/RegisterPage";
import { MemoryRouter } from "react-router-dom";


// NOTE: WILL FAIL - ADDED labels for the testing which have been commented out.
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
    await userEvent.selectOptions(screen.getByLabelText("Country"), "Singapore");
    await userEvent.selectOptions(screen.getByLabelText("Salutation"), "Mr");

    // Submit
    userEvent.click(screen.getByText("Create Account"));

    // Wait for success
    await waitFor(() => {
      expect(signupMock).toHaveBeenCalled();
      expect(screen.getByText(/Creating Account.../i)).toBeInTheDocument();
    });

  });
});