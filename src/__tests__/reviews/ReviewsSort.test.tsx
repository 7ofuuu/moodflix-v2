import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewsSort } from '@/components/features/reviews/ReviewsSort';

jest.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: {
    value: string;
    onValueChange: (v: string) => void;
    children: React.ReactNode;
  }) => (
    <select
      data-testid="sort-select"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => (
    <option value={value}>{children}</option>
  ),
}));

describe('ReviewsSort', () => {
  it('renders with the current sort value selected', () => {
    render(<ReviewsSort value="created_at.desc" onChange={jest.fn()} />);
    const select = screen.getByTestId('sort-select') as HTMLSelectElement;
    expect(select.value).toBe('created_at.desc');
  });

  it('calls onChange with the new value when selection changes', () => {
    const handleChange = jest.fn();
    render(<ReviewsSort value="created_at.desc" onChange={handleChange} />);
    const select = screen.getByTestId('sort-select');
    fireEvent.change(select, { target: { value: 'created_at.asc' } });
    expect(handleChange).toHaveBeenCalledWith('created_at.asc');
  });

  it('renders both sort options', () => {
    render(<ReviewsSort value="created_at.desc" onChange={jest.fn()} />);
    expect(screen.getByText('Newest First')).toBeInTheDocument();
    expect(screen.getByText('Oldest First')).toBeInTheDocument();
  });
});
