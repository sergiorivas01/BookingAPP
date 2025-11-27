import Table from 'cli-table3';
/**
 * Display a section header with box
 */
export declare function displaySection(title: string, subtitle?: string): void;
/**
 * Display a success message
 */
export declare function displaySuccess(message: string): void;
/**
 * Display an error message
 */
export declare function displayError(message: string): void;
/**
 * Display a warning message
 */
export declare function displayWarning(message: string): void;
/**
 * Display an info message
 */
export declare function displayInfo(message: string): void;
/**
 * Create a formatted table for data display
 */
export declare function createTable(headers: string[], rows: string[][]): Table.Table;
/**
 * Display a divider line
 */
export declare function displayDivider(char?: string, length?: number): void;
/**
 * Display a menu with better formatting
 */
export declare function displayMenu(title: string, options: string[]): void;
/**
 * Display property card
 */
export declare function displayPropertyCard(property: any): void;
//# sourceMappingURL=consoleHelpers.d.ts.map