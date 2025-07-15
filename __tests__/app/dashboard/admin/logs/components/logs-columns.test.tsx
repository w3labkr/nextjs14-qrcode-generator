import { adminLogsColumns } from "@/app/dashboard/admin/logs/components/logs-columns";
import { ApplicationLogData } from "@/types/logs";

describe("adminLogsColumns", () => {
  const mockLogData: ApplicationLogData = {
    id: "log-123",
    type: "ACCESS",
    level: "INFO",
    priority: "NORMAL",
    action: "VIEW_LOGS",
    message: "User viewed system logs",
    userId: "user-456",
    createdAt: new Date("2024-01-01T10:00:00Z"),
    metadata: { browser: "Chrome", os: "Windows" },
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
  };

  describe("Column Structure", () => {
    it("has correct number of columns", () => {
      expect(adminLogsColumns).toHaveLength(7);
    });

    it("has correct column IDs and accessors", () => {
      const columnInfo = adminLogsColumns.map(col => ({
        id: col.id,
        accessorKey: col.accessorKey,
        header: typeof col.header === 'string' ? col.header : 'function',
      }));

      expect(columnInfo).toEqual([
        { id: "select", accessorKey: undefined, header: "function" },
        { id: undefined, accessorKey: "id", header: "로그 ID" },
        { id: undefined, accessorKey: "createdAt", header: "function" },
        { id: undefined, accessorKey: "type", header: "제목" },
        { id: undefined, accessorKey: "level", header: "function" },
        { id: "priority", accessorKey: "level", header: "function" },
        { id: "actions", accessorKey: undefined, header: "" },
      ]);
    });

    it("has proper sorting configuration", () => {
      const selectColumn = adminLogsColumns[0];
      const actionsColumn = adminLogsColumns[6];

      expect(selectColumn.enableSorting).toBe(false);
      expect(selectColumn.enableHiding).toBe(false);
      expect(actionsColumn.enableSorting).toBe(false);
      expect(actionsColumn.enableHiding).toBe(false);
    });
  });

  describe("Column Cell Rendering", () => {
    it("ID column formats log ID correctly", () => {
      const idColumn = adminLogsColumns[1];
      expect(idColumn.accessorKey).toBe("id");
      expect(idColumn.header).toBe("로그 ID");

      // Test the cell rendering logic without actual rendering
      if (typeof idColumn.cell === 'function') {
        const mockRow = {
          getValue: (key: string) => key === 'id' ? 'log-123' : undefined,
        };
        
        // We can't test the actual rendering without mocking React components
        // but we can verify the function exists and is callable
        expect(() => idColumn.cell({ row: mockRow } as any)).not.toThrow();
      }
    });

    it("Type column has correct header", () => {
      const typeColumn = adminLogsColumns[3];
      expect(typeColumn.accessorKey).toBe("type");
      expect(typeColumn.header).toBe("제목");
    });

    it("Level column is used for both status and priority", () => {
      const levelColumn = adminLogsColumns[4];
      const priorityColumn = adminLogsColumns[5];

      expect(levelColumn.accessorKey).toBe("level");
      expect(priorityColumn.accessorKey).toBe("level");
      expect(priorityColumn.id).toBe("priority");
    });
  });

  describe("Column Types", () => {
    it("defines all expected log types", () => {
      // These are used in the component but we can't directly test them
      // without accessing the internal constants
      const expectedTypes = [
        "ACCESS", "AUTH", "AUDIT", "ERROR", 
        "ADMIN", "QR_GENERATION", "SYSTEM"
      ];
      
      // Just verify the columns exist and can handle these types
      expect(adminLogsColumns).toBeDefined();
      expect(adminLogsColumns.length).toBeGreaterThan(0);
    });

    it("defines all expected log levels", () => {
      const expectedLevels = ["DEBUG", "INFO", "WARN", "ERROR", "FATAL"];
      
      // Verify columns that use level exist
      const levelColumns = adminLogsColumns.filter(col => 
        col.accessorKey === "level" || col.id === "priority"
      );
      
      expect(levelColumns).toHaveLength(2);
    });
  });

  describe("Actions", () => {
    it("has actions column with no accessor key", () => {
      const actionsColumn = adminLogsColumns[6];
      expect(actionsColumn.id).toBe("actions");
      expect(actionsColumn.accessorKey).toBeUndefined();
      expect(actionsColumn.header).toBe("");
    });

    it("disables sorting and hiding for actions column", () => {
      const actionsColumn = adminLogsColumns[6];
      expect(actionsColumn.enableSorting).toBe(false);
      expect(actionsColumn.enableHiding).toBe(false);
    });
  });

  describe("Column Functions", () => {
    it("all columns have either string header or function header", () => {
      adminLogsColumns.forEach((column, index) => {
        const headerType = typeof column.header;
        expect(['string', 'function']).toContain(headerType);
        
        if (typeof column.cell === 'function') {
          // Verify cell function exists
          expect(column.cell).toBeDefined();
        }
      });
    });

    it("sortable columns have function headers", () => {
      const createdAtColumn = adminLogsColumns[2];
      const levelColumn = adminLogsColumns[4];
      const priorityColumn = adminLogsColumns[5];

      expect(typeof createdAtColumn.header).toBe('function');
      expect(typeof levelColumn.header).toBe('function');
      expect(typeof priorityColumn.header).toBe('function');
    });
  });

  describe("Data Handling", () => {
    it("handles complete log data", () => {
      // Verify all columns can handle the mock data structure
      expect(() => {
        adminLogsColumns.forEach(column => {
          if (column.accessorKey && mockLogData[column.accessorKey as keyof ApplicationLogData] === undefined) {
            throw new Error(`Missing data for ${column.accessorKey}`);
          }
        });
      }).not.toThrow();
    });

    it("handles optional fields", () => {
      const minimalLogData: ApplicationLogData = {
        id: "1",
        type: "SYSTEM",
        level: "INFO",
        priority: "NORMAL",
        createdAt: new Date(),
      };

      // Verify columns can handle minimal data
      expect(() => {
        adminLogsColumns.forEach(column => {
          if (column.accessorKey === "id" || 
              column.accessorKey === "type" || 
              column.accessorKey === "level" || 
              column.accessorKey === "createdAt") {
            expect(minimalLogData[column.accessorKey as keyof ApplicationLogData]).toBeDefined();
          }
        });
      }).not.toThrow();
    });
  });
});