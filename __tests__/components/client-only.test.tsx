import React from "react";
import { render, screen, act } from "@testing-library/react";
import { ClientOnly } from "@/components/client-only";

// Mock useEffect to control when it runs
const mockUseEffect = jest.fn();
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useEffect: (callback: () => void, deps: any[]) => {
    mockUseEffect(callback, deps);
    return jest.requireActual("react").useEffect(callback, deps);
  },
}));

describe("ClientOnly", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Component Rendering", () => {
    it("renders children after mounting", () => {
      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("client-content")).toBeInTheDocument();
      expect(screen.getByText("Client Content")).toBeInTheDocument();
    });

    it("renders fallback initially when specified", () => {
      // Mock useState to return false initially
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("fallback")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });

    it("renders null fallback by default", () => {
      // Mock useState to return false initially
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      const { container } = render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });

    it("renders children when hasMounted is true", () => {
      // Mock useState to return true (mounted state)
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([true, mockSetState]);

      render(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("client-content")).toBeInTheDocument();
      expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
    });
  });

  describe("Hydration Behavior", () => {
    it("sets hasMounted to true in useEffect", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), []);
      
      // Simulate useEffect callback execution
      const useEffectCallback = mockUseEffect.mock.calls[0][0];
      act(() => {
        useEffectCallback();
      });

      expect(mockSetState).toHaveBeenCalledWith(true);
    });

    it("useEffect is called with empty dependency array", () => {
      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(mockUseEffect).toHaveBeenCalledWith(expect.any(Function), []);
    });

    it("prevents hydration mismatch with fallback", () => {
      // Mock useState to return false initially, then true
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState")
        .mockReturnValueOnce([false, mockSetState])
        .mockReturnValueOnce([true, mockSetState]);

      const { rerender } = render(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      // Initial render shows fallback
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();

      // Rerender to simulate state change
      rerender(
        <ClientOnly fallback={<div data-testid="fallback">Loading...</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      // After mount, shows children
      expect(screen.getByTestId("client-content")).toBeInTheDocument();
      expect(screen.queryByTestId("fallback")).not.toBeInTheDocument();
    });
  });

  describe("Children Rendering", () => {
    it("renders single child element", () => {
      render(
        <ClientOnly>
          <div data-testid="single-child">Single Child</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("single-child")).toBeInTheDocument();
      expect(screen.getByText("Single Child")).toBeInTheDocument();
    });

    it("renders multiple child elements", () => {
      render(
        <ClientOnly>
          <div data-testid="first-child">First Child</div>
          <div data-testid="second-child">Second Child</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("first-child")).toBeInTheDocument();
      expect(screen.getByTestId("second-child")).toBeInTheDocument();
      expect(screen.getByText("First Child")).toBeInTheDocument();
      expect(screen.getByText("Second Child")).toBeInTheDocument();
    });

    it("renders complex nested components", () => {
      const ComplexComponent = () => (
        <div data-testid="complex-component">
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      );

      render(
        <ClientOnly>
          <ComplexComponent />
        </ClientOnly>
      );

      expect(screen.getByTestId("complex-component")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Paragraph")).toBeInTheDocument();
      expect(screen.getByText("Button")).toBeInTheDocument();
    });

    it("renders children with props", () => {
      const ChildWithProps = ({ name }: { name: string }) => (
        <div data-testid="child-with-props">Hello, {name}!</div>
      );

      render(
        <ClientOnly>
          <ChildWithProps name="World" />
        </ClientOnly>
      );

      expect(screen.getByTestId("child-with-props")).toBeInTheDocument();
      expect(screen.getByText("Hello, World!")).toBeInTheDocument();
    });
  });

  describe("Fallback Rendering", () => {
    it("renders string fallback", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly fallback="Loading...">
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });

    it("renders JSX fallback", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly fallback={<div data-testid="jsx-fallback">JSX Fallback</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("jsx-fallback")).toBeInTheDocument();
      expect(screen.getByText("JSX Fallback")).toBeInTheDocument();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });

    it("renders complex fallback component", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      const ComplexFallback = () => (
        <div data-testid="complex-fallback">
          <div className="spinner" />
          <p>Loading content...</p>
        </div>
      );

      render(
        <ClientOnly fallback={<ComplexFallback />}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("complex-fallback")).toBeInTheDocument();
      expect(screen.getByText("Loading content...")).toBeInTheDocument();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });

    it("renders null fallback when not specified", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      const { container } = render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId("client-content")).not.toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("initializes hasMounted state to false", () => {
      const mockSetState = jest.fn();
      const mockUseState = jest.spyOn(React, "useState");
      mockUseState.mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(mockUseState).toHaveBeenCalledWith(false);
    });

    it("updates hasMounted state through useEffect", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      // Simulate useEffect callback execution
      const useEffectCallback = mockUseEffect.mock.calls[0][0];
      act(() => {
        useEffectCallback();
      });

      expect(mockSetState).toHaveBeenCalledWith(true);
    });

    it("calls setState to update mount state", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      // Simulate useEffect callback execution
      const useEffectCallback = mockUseEffect.mock.calls[0][0];
      act(() => {
        useEffectCallback();
      });

      expect(mockSetState).toHaveBeenCalledWith(true);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty children gracefully", () => {
      const { container } = render(<ClientOnly>{null}</ClientOnly>);

      // The component renders a fragment, which doesn't create a DOM node
      expect(container.innerHTML).toBe("");
    });

    it("handles undefined children", () => {
      const { container } = render(<ClientOnly>{undefined}</ClientOnly>);

      // The component renders a fragment, which doesn't create a DOM node
      expect(container.innerHTML).toBe("");
    });

    it("handles boolean children", () => {
      render(<ClientOnly>{false}</ClientOnly>);

      expect(screen.queryByText("false")).not.toBeInTheDocument();
    });

    it("handles number children", () => {
      render(<ClientOnly>{42}</ClientOnly>);

      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("handles array of children", () => {
      render(
        <ClientOnly>
          {[
            <div key="1" data-testid="child-1">Child 1</div>,
            <div key="2" data-testid="child-2">Child 2</div>,
          ]}
        </ClientOnly>
      );

      expect(screen.getByTestId("child-1")).toBeInTheDocument();
      expect(screen.getByTestId("child-2")).toBeInTheDocument();
    });

    it("handles conditional children", () => {
      const showChild = true;

      render(
        <ClientOnly>
          {showChild && <div data-testid="conditional-child">Conditional Child</div>}
        </ClientOnly>
      );

      expect(screen.getByTestId("conditional-child")).toBeInTheDocument();
    });

    it("handles fragment children", () => {
      render(
        <ClientOnly>
          <>
            <div data-testid="fragment-child-1">Fragment Child 1</div>
            <div data-testid="fragment-child-2">Fragment Child 2</div>
          </>
        </ClientOnly>
      );

      expect(screen.getByTestId("fragment-child-1")).toBeInTheDocument();
      expect(screen.getByTestId("fragment-child-2")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    it("does not cause unnecessary re-renders", () => {
      const { rerender } = render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      // Same props should not cause issues
      rerender(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("client-content")).toBeInTheDocument();
    });

    it("handles prop changes correctly", () => {
      const { rerender } = render(
        <ClientOnly fallback={<div data-testid="fallback-1">Fallback 1</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      rerender(
        <ClientOnly fallback={<div data-testid="fallback-2">Fallback 2</div>}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("client-content")).toBeInTheDocument();
    });
  });

  describe("TypeScript Interface", () => {
    it("accepts ReactNode children", () => {
      const ReactNodeChild = () => <div data-testid="react-node">React Node</div>;

      render(
        <ClientOnly>
          <ReactNodeChild />
        </ClientOnly>
      );

      expect(screen.getByTestId("react-node")).toBeInTheDocument();
    });

    it("accepts ReactNode fallback", () => {
      const mockSetState = jest.fn();
      jest.spyOn(React, "useState").mockReturnValueOnce([false, mockSetState]);

      const ReactNodeFallback = () => <div data-testid="react-node-fallback">React Node Fallback</div>;

      render(
        <ClientOnly fallback={<ReactNodeFallback />}>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("react-node-fallback")).toBeInTheDocument();
    });

    it("handles optional fallback prop", () => {
      render(
        <ClientOnly>
          <div data-testid="client-content">Client Content</div>
        </ClientOnly>
      );

      expect(screen.getByTestId("client-content")).toBeInTheDocument();
    });
  });
});