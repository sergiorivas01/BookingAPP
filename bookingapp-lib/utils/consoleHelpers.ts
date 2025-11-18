/**
 * Console helper utilities for better visual organization
 */
import boxen from 'boxen';
import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Display a section header with box
 */
export function displaySection(title: string, subtitle?: string): void {
  const content = subtitle 
    ? `${chalk.bold.cyan(title)}\n${chalk.gray(subtitle)}`
    : chalk.bold.cyan(title);
  
  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor: 'cyan',
    })
  );
}

/**
 * Display a success message
 */
export function displaySuccess(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Display an error message
 */
export function displayError(message: string): void {
  console.log(chalk.red('✗'), message);
}

/**
 * Display a warning message
 */
export function displayWarning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Display an info message
 */
export function displayInfo(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

/**
 * Create a formatted table for data display
 */
export function createTable(headers: string[], rows: string[][]) {
  const table = new Table({
    head: headers.map(h => chalk.cyan(h)),
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
export function displayDivider(char: string = '─', length: number = 60): void {
  console.log(chalk.gray(char.repeat(length)));
}

/**
 * Display a menu with better formatting
 */
export function displayMenu(title: string, options: string[]): void {
  displaySection(title);
  options.forEach((option, index) => {
    console.log(chalk.gray(`  ${index + 1}.`), option);
  });
  console.log('');
}

/**
 * Display property card
 */
export function displayPropertyCard(property: any): void {
  const content = [
    chalk.bold.white(property.name),
    '',
    chalk.gray('Type:'), property.specifications.type || 'N/A',
    chalk.gray('Price:'), chalk.green(`$${property.price}/night`),
    chalk.gray('Status:'), property.availability,
    property.description ? `\n${chalk.gray(property.description)}` : '',
  ].filter(Boolean).join('\n');

  console.log(
    boxen(content, {
      padding: 1,
      margin: { top: 0.5, bottom: 0.5 },
      borderStyle: 'round',
      borderColor: 'blue',
    })
  );
}

