jest.mock('boxen', () => jest.fn((content: string) => `box:${content}`));
jest.mock('chalk', () => ({
  bold: {
    cyan: (str: string) => `cyan:${str}`,
    white: (str: string) => `white:${str}`,
    yellow: (str: string) => `yellow:${str}`,
  },
  cyan: (str: string) => `cyan:${str}`,
  gray: (str: string) => `gray:${str}`,
  green: (str: string) => `green:${str}`,
  red: (str: string) => `red:${str}`,
  yellow: (str: string) => `yellow:${str}`,
  blue: (str: string) => `blue:${str}`,
}));

import boxen from 'boxen';
import {
  displaySection,
  displaySuccess,
  displayError,
  displayWarning,
  displayInfo,
  createTable,
  displayDivider,
  displayMenu,
  displayPropertyCard,
} from '../consoleHelpers';

describe('consoleHelpers', () => {
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      // suppress console output in tests
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    (boxen as jest.Mock).mockClear();
  });

  it('displaySection should log boxed content', () => {
    displaySection('Title', 'Subtitle');
    expect(boxen).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('box:'));
  });

  it('displaySuccess should show success icon', () => {
    displaySuccess('Success message');
    expect(consoleSpy).toHaveBeenCalledWith('green:✓', 'Success message');
  });

  it('displayError should show error icon', () => {
    displayError('Error message');
    expect(consoleSpy).toHaveBeenCalledWith('red:✗', 'Error message');
  });

  it('displayWarning should show warning icon', () => {
    displayWarning('Warning message');
    expect(consoleSpy).toHaveBeenCalledWith('yellow:⚠', 'Warning message');
  });

  it('displayInfo should show info icon', () => {
    displayInfo('Info message');
    expect(consoleSpy).toHaveBeenCalledWith('blue:ℹ', 'Info message');
  });

  it('createTable should return a table instance', () => {
    const table = createTable(['Header'], [['Row 1']]);
    expect(table).toBeDefined();
    expect(table.toString()).toContain('Row 1');
  });

  it('displayDivider should log divider line', () => {
    displayDivider('-', 5);
    expect(consoleSpy).toHaveBeenCalledWith('gray:-----');
  });

  it('displayMenu should render options', () => {
    displayMenu('Menu Title', ['Option 1', 'Option 2']);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('displayPropertyCard should render property details', () => {
    displayPropertyCard({
      name: 'Sample Property',
      price: 200,
      availability: 'available',
      description: 'A lovely place',
      specifications: { type: 'apartment' },
    });
    expect(boxen).toHaveBeenCalled();
  });
});

