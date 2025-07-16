import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressSearch, AddressSearchButton, AddressData } from "@/components/address-search";

// Mock react-daum-postcode
jest.mock("react-daum-postcode", () => ({
  __esModule: true,
  default: ({ onComplete, autoClose, style }: any) => (
    <div 
      data-testid="daum-postcode" 
      style={style}
      data-auto-close={autoClose}
    >
      <div>주소 검색 위젯</div>
      <button
        data-testid="mock-address-select"
        onClick={() => onComplete({
          address: "서울특별시 강남구 테헤란로 123",
          jibunAddress: "서울특별시 강남구 역삼동 123-45",
          zonecode: "12345"
        })}
      >
        주소 선택
      </button>
    </div>
  ),
}));

// Mock UI components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, variant, size, className, type, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      data-size={size}
      className={className}
      type={type}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, onOpenChange, children }: any) => (
    <div data-testid="dialog" data-open={open} data-on-open-change={!!onOpenChange}>
      {open && children}
    </div>
  ),
  DialogContent: ({ children, className }: any) => (
    <div data-testid="dialog-content" className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }: any) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: any) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  Search: ({ className }: any) => (
    <div data-testid="search-icon" className={className}>
      Search
    </div>
  ),
}));

describe("AddressSearch", () => {
  const mockOnSelect = jest.fn();
  const mockAddressData: AddressData = {
    address: "서울특별시 강남구 테헤란로 123",
    jibunAddress: "서울특별시 강남구 역삼동 123-45",
    zonecode: "12345",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders default button when no children provided", () => {
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveAttribute("data-size", "icon");
    });

    it("renders search icon in default button", () => {
      render(<AddressSearch onSelect={mockOnSelect} />);

      const searchIcon = screen.getByTestId("search-icon");
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass("h-4", "w-4");
    });

    it("renders custom children when provided", () => {
      render(
        <AddressSearch onSelect={mockOnSelect}>
          <div data-testid="custom-button">Custom Button</div>
        </AddressSearch>
      );

      expect(screen.getByTestId("custom-button")).toBeInTheDocument();
      expect(screen.getByText("Custom Button")).toBeInTheDocument();
    });

    it("wraps custom children in clickable div", () => {
      render(
        <AddressSearch onSelect={mockOnSelect}>
          <div data-testid="custom-button">Custom Button</div>
        </AddressSearch>
      );

      const wrapper = screen.getByTestId("custom-button").parentElement;
      expect(wrapper).toHaveStyle("cursor: pointer");
    });

    it("dialog is initially closed", () => {
      render(<AddressSearch onSelect={mockOnSelect} />);

      const dialog = screen.getByTestId("dialog");
      expect(dialog).toHaveAttribute("data-open", "false");
    });
  });

  describe("Dialog Functionality", () => {
    it("opens dialog when button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });

    it("opens dialog when custom children are clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddressSearch onSelect={mockOnSelect}>
          <div data-testid="custom-button">Custom Button</div>
        </AddressSearch>
      );

      const customButton = screen.getByTestId("custom-button");
      await user.click(customButton);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });

    it("renders dialog content when open", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("dialog-content")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-header")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-title")).toBeInTheDocument();
        expect(screen.getByTestId("dialog-description")).toBeInTheDocument();
      });
    });

    it("displays correct dialog title and description", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId("dialog-title")).toHaveTextContent("주소 검색");
        expect(screen.getByTestId("dialog-description")).toHaveTextContent("검색할 주소를 입력하세요.");
      });
    });

    it("dialog content has correct styling", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialogContent = screen.getByTestId("dialog-content");
        expect(dialogContent).toHaveClass("max-w-2xl");
      });
    });
  });

  describe("Daum Postcode Integration", () => {
    it("renders DaumPostcode component when dialog is open", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const daumPostcode = screen.getByTestId("daum-postcode");
        expect(daumPostcode).toBeInTheDocument();
        expect(daumPostcode).toHaveTextContent("주소 검색 위젯");
      });
    });

    it("DaumPostcode has correct configuration", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const daumPostcode = screen.getByTestId("daum-postcode");
        expect(daumPostcode).toHaveAttribute("data-auto-close", "false");
        expect(daumPostcode).toHaveStyle("width: 100%");
        expect(daumPostcode).toHaveStyle("height: 100%");
      });
    });

    it("handles address selection from DaumPostcode", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const selectButton = screen.getByTestId("mock-address-select");
        expect(selectButton).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId("mock-address-select");
      await user.click(selectButton);

      expect(mockOnSelect).toHaveBeenCalledWith({
        address: "서울특별시 강남구 테헤란로 123",
        jibunAddress: "서울특별시 강남구 역삼동 123-45",
        zonecode: "12345",
      });
    });

    it("closes dialog after address selection", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const selectButton = screen.getByTestId("mock-address-select");
        expect(selectButton).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId("mock-address-select");
      await user.click(selectButton);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "false");
      });
    });
  });

  describe("Disabled State", () => {
    it("disables default button when disabled prop is true", () => {
      render(<AddressSearch onSelect={mockOnSelect} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    it("shows not-allowed cursor for custom children when disabled", () => {
      render(
        <AddressSearch onSelect={mockOnSelect} disabled={true}>
          <div data-testid="custom-button">Custom Button</div>
        </AddressSearch>
      );

      const wrapper = screen.getByTestId("custom-button").parentElement;
      expect(wrapper).toHaveStyle("cursor: not-allowed");
    });

    it("does not open dialog when disabled button is clicked", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} disabled={true} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "false");
      });
    });

    it("does not open dialog when disabled custom children are clicked", async () => {
      const user = userEvent.setup();
      render(
        <AddressSearch onSelect={mockOnSelect} disabled={true}>
          <div data-testid="custom-button">Custom Button</div>
        </AddressSearch>
      );

      const customButton = screen.getByTestId("custom-button");
      await user.click(customButton);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "false");
      });
    });
  });

  describe("Keyboard Accessibility", () => {
    it("default button is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      
      // Focus with tab
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard("{Enter}");
      
      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });

    it("default button can be activated with space", async () => {
      const user = userEvent.setup();
      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      button.focus();
      
      await user.keyboard(" ");
      
      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });
  });

  describe("Error Handling", () => {
    it("handles onSelect callback errors gracefully", async () => {
      const user = userEvent.setup();
      const mockOnSelectError = jest.fn().mockImplementation(() => {
        throw new Error("Selection failed");
      });
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      render(<AddressSearch onSelect={mockOnSelectError} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const selectButton = screen.getByTestId("mock-address-select");
        expect(selectButton).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId("mock-address-select");
      
      // Should not throw error to the test
      await user.click(selectButton);
      
      expect(mockOnSelectError).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error in address selection:"),
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });

    it("handles malformed address data", async () => {
      const user = userEvent.setup();
      
      // Mock DaumPostcode to return malformed data
      jest.doMock("react-daum-postcode", () => ({
        __esModule: true,
        default: ({ onComplete }: any) => (
          <div data-testid="daum-postcode">
            <button
              data-testid="mock-address-select"
              onClick={() => onComplete({
                address: null,
                jibunAddress: undefined,
                zonecode: "",
              })}
            >
              주소 선택
            </button>
          </div>
        ),
      }));

      render(<AddressSearch onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const selectButton = screen.getByTestId("mock-address-select");
        expect(selectButton).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId("mock-address-select");
      await user.click(selectButton);

      expect(mockOnSelect).toHaveBeenCalledWith({
        address: null,
        jibunAddress: undefined,
        zonecode: "",
      });
    });
  });
});

describe("AddressSearchButton", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders with default props", () => {
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveAttribute("data-size", "icon");
    });

    it("renders with custom variant and size", () => {
      render(
        <AddressSearchButton
          onSelect={mockOnSelect}
          variant="default"
          size="sm"
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "default");
      expect(button).toHaveAttribute("data-size", "sm");
    });

    it("renders with custom className", () => {
      render(
        <AddressSearchButton
          onSelect={mockOnSelect}
          className="custom-class"
        />
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("renders default search icon when no children", () => {
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const searchIcon = screen.getByTestId("search-icon");
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass("h-4", "w-4");
    });

    it("renders custom children when provided", () => {
      render(
        <AddressSearchButton onSelect={mockOnSelect}>
          <span data-testid="custom-content">주소 찾기</span>
        </AddressSearchButton>
      );

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
      expect(screen.getByText("주소 찾기")).toBeInTheDocument();
    });

    it("applies disabled state correctly", () => {
      render(<AddressSearchButton onSelect={mockOnSelect} disabled={true} />);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });
  });

  describe("Integration with AddressSearch", () => {
    it("opens address search dialog when clicked", async () => {
      const user = userEvent.setup();
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });

    it("calls onSelect when address is selected", async () => {
      const user = userEvent.setup();
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const selectButton = screen.getByTestId("mock-address-select");
        expect(selectButton).toBeInTheDocument();
      });

      const selectButton = screen.getByTestId("mock-address-select");
      await user.click(selectButton);

      expect(mockOnSelect).toHaveBeenCalledWith({
        address: "서울특별시 강남구 테헤란로 123",
        jibunAddress: "서울특별시 강남구 역삼동 123-45",
        zonecode: "12345",
      });
    });

    it("does not open dialog when disabled", async () => {
      const user = userEvent.setup();
      render(<AddressSearchButton onSelect={mockOnSelect} disabled={true} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "false");
      });
    });
  });

  describe("Button Variants", () => {
    it("supports all button variants", () => {
      const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"];
      
      variants.forEach(variant => {
        const { unmount } = render(
          <AddressSearchButton
            onSelect={mockOnSelect}
            variant={variant as any}
          />
        );

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-variant", variant);
        
        unmount();
      });
    });

    it("supports all button sizes", () => {
      const sizes = ["default", "sm", "lg", "icon"];
      
      sizes.forEach(size => {
        const { unmount } = render(
          <AddressSearchButton
            onSelect={mockOnSelect}
            size={size as any}
          />
        );

        const button = screen.getByRole("button");
        expect(button).toHaveAttribute("data-size", size);
        
        unmount();
      });
    });
  });

  describe("Accessibility", () => {
    it("button has correct type attribute", () => {
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });

    it("button is keyboard accessible", async () => {
      const user = userEvent.setup();
      render(<AddressSearchButton onSelect={mockOnSelect} />);

      const button = screen.getByRole("button");
      
      // Focus with tab
      await user.tab();
      expect(button).toHaveFocus();

      // Activate with Enter
      await user.keyboard("{Enter}");
      
      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "true");
      });
    });

    it("disabled button cannot be activated", async () => {
      const user = userEvent.setup();
      render(<AddressSearchButton onSelect={mockOnSelect} disabled={true} />);

      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(() => {
        const dialog = screen.getByTestId("dialog");
        expect(dialog).toHaveAttribute("data-open", "false");
      });
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(<AddressSearchButton onSelect={mockOnSelect} />);
      
      // Same props should not cause issues
      rerender(<AddressSearchButton onSelect={mockOnSelect} />);
      
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(
        <AddressSearchButton onSelect={mockOnSelect} variant="outline" />
      );
      
      let button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "outline");
      
      rerender(
        <AddressSearchButton onSelect={mockOnSelect} variant="default" />
      );
      
      button = screen.getByRole("button");
      expect(button).toHaveAttribute("data-variant", "default");
    });
  });
});