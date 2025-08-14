import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RegisterPage from "../pages/RegisterPage";

// Mock the SignupForm component
vi.mock("../components/SignupForm", () => {
  return {
    default: () => <div data-testid="mock-signup-form">Signup Form</div>,
  };
});

describe("RegisterPage", () => {
  it("renders the logo, title, and SignupForm", () => {
    render(<RegisterPage />);

    // Check logo
    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", expect.stringContaining("logo.png"));

    // Check title
    expect(screen.getByText("Create an Account")).toBeInTheDocument();

    // Check that mocked SignupForm is rendered
    expect(screen.getByTestId("mock-signup-form")).toBeInTheDocument();
  });
});