import { Button } from '@chakra-ui/button'
import { TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons'
import { Center, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { Table, TableProps, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  flexRender,
  Row,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table'
import React from 'react'

export interface SimpleField<T> extends TableProps {
  key: string
  name: React.ReactNode
  render: (item: T, index: number) => React.ReactNode
  hidden?: boolean
}

export interface SimpleTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  displayCount?: number
  isLoading?: boolean
  empty?: React.ReactNode
  skeleton?: React.ReactNode
  onMore?: React.ReactNode
  pagination?: PaginationState
}

export default function SortableTable<T>({
  columns,
  data,
  displayCount,
  isLoading = false,
  empty,
  skeleton,
  onMore,
  pagination = { pageIndex: 0, pageSize: data.length },
  ...props
}: SimpleTableProps<T> & TableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
      pagination,
    },
  })

  function renderSingleton(child: React.ReactNode) {
    return (
      <Tr>
        <Td colSpan={columns.length}>
          <Center>{child}</Center>
        </Td>
      </Tr>
    )
  }

  function renderRow(row: Row<T>) {
    return (
      <Tr key={row.id}>
        {row.getVisibleCells().map(cell => (
          <Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Td>
        ))}
      </Tr>
    )
  }

  // function renderShowMore() {
  //   if (displayAll) return
  //
  //   if (data.length <= defaultLineCount) return
  //
  //   return renderSingleton(
  //     <Button variant="unstyled" onClick={() => setDisplayAll(true)}>
  //       Show more
  //     </Button>,
  //   )
  // }
  //
  // function renderLoadingMore() {
  //   if (!hasMore) return
  //
  //   return renderSingleton(
  //     <InView style={{ width: '100%' }} onChange={inView => inView && onMore?.()}>
  //       {skeleton || <SkeletonText w="100%" noOfLines={2} />}
  //     </InView>,
  //   )
  // }

  function renderRows() {
    const { rows } = table.getRowModel()

    if (rows.length === 0) {
      if (isLoading) return renderSingleton(skeleton || <SkeletonText w="100%" noOfLines={2} />)
      else return renderSingleton(<Text>{empty || 'No data'}</Text>)
    }

    return rows.slice(0, displayCount).map(renderRow)
  }

  return (
    <Table {...props}>
      <Thead>
        <Tr>
          {table.getHeaderGroups()[0].headers.map(header => {
            return (
              <Th key={header.id} onClick={header.column.getToggleSortingHandler()}>
                {header.column.getCanSort() ? (
                  <Button variant="link" fontSize="sm" isActive={!!header.column.getIsSorted()}>
                    {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                    {{
                      asc: <TriangleUpIcon />,
                      desc: <TriangleDownIcon />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </Button>
                ) : (
                  flexRender(header.column.columnDef.header, header.getContext())
                )}
              </Th>
            )
          })}
        </Tr>
      </Thead>
      <Tbody>
        {renderRows()}
        {onMore}
      </Tbody>
    </Table>
  )
}
