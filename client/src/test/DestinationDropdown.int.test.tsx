import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {DestinationDropdown} from "../components/DestinationDropdown";
import {describe, test, expect, vi} from 'vitest';


//server must be on when testing
describe("DestinationDropdown (integration with real backend)", () => {
  test("fetches and displays destinations from the real backend", async () => {
    const mockSelect = vi.fn();
    render(
        <DestinationDropdown
            onSelect={mockSelect}
            selectedDestination={null}    
        />
    );

    // Type in the search input
    const input = screen.getByPlaceholderText(/search destination/i);
    fireEvent.change(input, { target: { value: "Singapore" } });

    // Wait for results to appear
    await waitFor(() => {
      const results = screen.getAllByText(/Singapore/i)
      expect(results.length).toBeGreaterThan(0);
    });
  });
});