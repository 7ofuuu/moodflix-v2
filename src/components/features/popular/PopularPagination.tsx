'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PopularPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PopularPagination({
  currentPage,
  totalPages,
  onPageChange,
}: PopularPaginationProps) {
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      items.push(1);
      if (startPage > 2) {
        items.push('ellipsis-start');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push('ellipsis-end');
      }
      items.push(totalPages);
    }

    return items;
  };

  return (
    <>
      <div className='flex items-center justify-center py-8'>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href='#'
                onClick={e => {
                  e.preventDefault();
                  onPageChange(currentPage - 1);
                }}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>

            {getPaginationItems().map((item, index) => (
              <PaginationItem key={index}>
                {item === 'ellipsis-start' || item === 'ellipsis-end' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href='#'
                    onClick={e => {
                      e.preventDefault();
                      onPageChange(item as number);
                    }}
                    isActive={currentPage === item}
                  >
                    {item}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href='#'
                onClick={e => {
                  e.preventDefault();
                  onPageChange(currentPage + 1);
                }}
                className={
                  currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div className='text-center text-sm text-muted-foreground mb-8'>
        Page {currentPage} of {totalPages}
      </div>
    </>
  );
}
