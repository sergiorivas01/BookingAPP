"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('boxen', () => jest.fn((content) => `box:${content}`));
jest.mock('chalk', () => ({
    bold: {
        cyan: (str) => `cyan:${str}`,
        white: (str) => `white:${str}`,
        yellow: (str) => `yellow:${str}`,
    },
    cyan: (str) => `cyan:${str}`,
    gray: (str) => `gray:${str}`,
    green: (str) => `green:${str}`,
    red: (str) => `red:${str}`,
    yellow: (str) => `yellow:${str}`,
    blue: (str) => `blue:${str}`,
}));
const boxen_1 = __importDefault(require("boxen"));
const consoleHelpers_1 = require("../consoleHelpers");
describe('consoleHelpers', () => {
    let consoleSpy;
    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
            // suppress console output in tests
        });
    });
    afterEach(() => {
        consoleSpy.mockRestore();
        boxen_1.default.mockClear();
    });
    it('displaySection should log boxed content', () => {
        (0, consoleHelpers_1.displaySection)('Title', 'Subtitle');
        expect(boxen_1.default).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('box:'));
    });
    it('displaySuccess should show success icon', () => {
        (0, consoleHelpers_1.displaySuccess)('Success message');
        expect(consoleSpy).toHaveBeenCalledWith('green:✓', 'Success message');
    });
    it('displayError should show error icon', () => {
        (0, consoleHelpers_1.displayError)('Error message');
        expect(consoleSpy).toHaveBeenCalledWith('red:✗', 'Error message');
    });
    it('displayWarning should show warning icon', () => {
        (0, consoleHelpers_1.displayWarning)('Warning message');
        expect(consoleSpy).toHaveBeenCalledWith('yellow:⚠', 'Warning message');
    });
    it('displayInfo should show info icon', () => {
        (0, consoleHelpers_1.displayInfo)('Info message');
        expect(consoleSpy).toHaveBeenCalledWith('blue:ℹ', 'Info message');
    });
    it('createTable should return a table instance', () => {
        const table = (0, consoleHelpers_1.createTable)(['Header'], [['Row 1']]);
        expect(table).toBeDefined();
        expect(table.toString()).toContain('Row 1');
    });
    it('displayDivider should log divider line', () => {
        (0, consoleHelpers_1.displayDivider)('-', 5);
        expect(consoleSpy).toHaveBeenCalledWith('gray:-----');
    });
    it('displayMenu should render options', () => {
        (0, consoleHelpers_1.displayMenu)('Menu Title', ['Option 1', 'Option 2']);
        expect(consoleSpy).toHaveBeenCalled();
    });
    it('displayPropertyCard should render property details', () => {
        (0, consoleHelpers_1.displayPropertyCard)({
            name: 'Sample Property',
            price: 200,
            availability: 'available',
            description: 'A lovely place',
            specifications: { type: 'apartment' },
        });
        expect(boxen_1.default).toHaveBeenCalled();
    });
});
//# sourceMappingURL=consoleHelpers.test.js.map