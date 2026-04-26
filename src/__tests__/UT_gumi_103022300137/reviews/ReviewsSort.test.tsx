import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewsFilters } from '@/components/features/reviews/ReviewsFilters';

jest.mock('@/components/ui/filter-combobox', () => ({
  FilterCombobox: ({
    value,
    onValueChange,
    placeholder,
    options,
  }: {
    value: string;
    onValueChange: (v: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
  }) => (
    <select
      aria-label={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

const defaultProps = {
  sortBy: 'created_at.desc',
  selectedGenre: 'all',
  selectedEra: 'All Eras',
  minRating: '0',
  onSortChange: jest.fn(),
  onGenreChange: jest.fn(),
  onEraChange: jest.fn(),
  onMinRatingChange: jest.fn(),
  onReset: jest.fn(),
};

describe('ReviewsFilters', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders sort dropdown with correct value', () => {
    render(<ReviewsFilters {...defaultProps} />);
    const sortSelect = screen.getByLabelText('Sort by') as HTMLSelectElement;
    expect(sortSelect.value).toBe('created_at.desc');
  });

  it('calls onSortChange when sort selection changes', () => {
    render(<ReviewsFilters {...defaultProps} />);
    const sortSelect = screen.getByLabelText('Sort by');
    fireEvent.change(sortSelect, { target: { value: 'vote_average.desc' } });
    expect(defaultProps.onSortChange).toHaveBeenCalledWith('vote_average.desc');
  });

  it('renders all 4 sort options', () => {
    render(<ReviewsFilters {...defaultProps} />);
    expect(screen.getByText('Newest Review')).toBeInTheDocument();
    expect(screen.getByText('Oldest Review')).toBeInTheDocument();
    expect(screen.getByText('Highest Rated Movie')).toBeInTheDocument();
    expect(screen.getByText('Most Popular Movie')).toBeInTheDocument();
  });

  it('renders genre, era, and rating filter dropdowns', () => {
    render(<ReviewsFilters {...defaultProps} />);
    expect(screen.getByLabelText('All Genres')).toBeInTheDocument();
    expect(screen.getByLabelText('All Eras')).toBeInTheDocument();
    expect(screen.getByLabelText('Any Rating')).toBeInTheDocument();
  });

  it('calls onReset when reset button is clicked', () => {
    render(<ReviewsFilters {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('calls onGenreChange when genre changes', () => {
    render(<ReviewsFilters {...defaultProps} />);
    const genreSelect = screen.getByLabelText('All Genres');
    fireEvent.change(genreSelect, { target: { value: '28' } });
    expect(defaultProps.onGenreChange).toHaveBeenCalledWith('28');
  });
});
