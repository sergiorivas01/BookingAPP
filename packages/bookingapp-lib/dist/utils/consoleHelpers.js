"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displaySection = displaySection;
exports.displaySuccess = displaySuccess;
exports.displayError = displayError;
exports.displayWarning = displayWarning;
exports.displayInfo = displayInfo;
exports.createTable = createTable;
exports.displayDivider = displayDivider;
exports.displayMenu = displayMenu;
exports.displayPropertyCard = displayPropertyCard;
/**
 * Console helper utilities for better visual organization
 */
const boxen_1 = __importDefault(require("boxen"));
const chalk_1 = __importDefault(require("chalk"));
const cli_table3_1 = __importDefault(require("cli-table3"));
/**
 * Display a section header with box
 */
function displaySection(title, subtitle) {
    const content = subtitle
        ? `${chalk_1.default.bold.cyan(title)}\n${chalk_1.default.gray(subtitle)}`
        : chalk_1.default.bold.cyan(title);
    console.log((0, boxen_1.default)(content, {
        padding: 1,
        margin: { top: 1, bottom: 1 },
        borderStyle: 'round',
        borderColor: 'cyan',
    }));
}
/**
 * Display a success message
 */
function displaySuccess(message) {
    console.log(chalk_1.default.green('✓'), message);
}
/**
 * Display an error message
 */
function displayError(message) {
    console.log(chalk_1.default.red('✗'), message);
}
/**
 * Display a warning message
 */
function displayWarning(message) {
    console.log(chalk_1.default.yellow('⚠'), message);
}
/**
 * Display an info message
 */
function displayInfo(message) {
    console.log(chalk_1.default.blue('ℹ'), message);
}
/**
 * Create a formatted table for data display
 */
function createTable(headers, rows) {
    const table = new cli_table3_1.default({
        head: headers.map(h => chalk_1.default.cyan(h)),
        style: {
            head: ['cyan'],
            border: ['gray'],
        },
    });
    rows.forEach(row => table.push(row));
    return table;
}
/**
 * Display a divider line
 */
function displayDivider(char = '─', length = 60) {
    console.log(chalk_1.default.gray(char.repeat(length)));
}
/**
 * Display a menu with better formatting
 */
function displayMenu(title, options) {
    displaySection(title);
    options.forEach((option, index) => {
        console.log(chalk_1.default.gray(`  ${index + 1}.`), option);
    });
    console.log('');
}
/**
 * Display property card
 */
function displayPropertyCard(property) {
    const content = [
        chalk_1.default.bold.white(property.name),
        '',
        chalk_1.default.gray('Type:'), property.specifications.type || 'N/A',
        chalk_1.default.gray('Price:'), chalk_1.default.green(`$${property.price}/night`),
        chalk_1.default.gray('Status:'), property.availability,
        property.description ? `\n${chalk_1.default.gray(property.description)}` : '',
    ].filter(Boolean).join('\n');
    console.log((0, boxen_1.default)(content, {
        padding: 1,
        margin: { top: 0.5, bottom: 0.5 },
        borderStyle: 'round',
        borderColor: 'blue',
    }));
}
//# sourceMappingURL=consoleHelpers.js.map