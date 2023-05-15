import { Button } from '@chakra-ui/button'
import { Center, Text } from '@chakra-ui/layout'
import { SkeletonText } from '@chakra-ui/skeleton'
import { Table, TableProps, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/table'
import React, { useState } from 'react'
import InView from 'react-intersection-observer'

export interface SimpleField<T> extends TableProps {
  key: string
  name: React.ReactNode
  render: (item: T, index: number) => React.ReactNode
  hidden?: boolean
}

export interface SimpleTableProps<T> {
  fields: SimpleField<T>[]
  data: T[]
  defaultLineCount?: number
  isLoading?: boolean
  empty?: React.ReactNode
  skeleton?: React.ReactNode
  getKey?: (item: T, index: number) => string
  hasMore?: boolean
  onMore?: () => void
}

export default function SimpleTable<T>({
  fields,
  data,
  defaultLineCount = 5,
  isLoading = false,
  empty,
  skeleton,
  getKey = (_, i) => `${i}`,
  hasMore,
  onMore,
  ...props
}: SimpleTableProps<T> & TableProps) {
  const [displayAll, setDisplayAll] = useState(!!onMore)

  const visibleFields = fields.filter(field => !field.hidden)

  function renderColumnName({ key, name }: SimpleField<T>) {
    return <Th key={key}>{name}</Th>
  }

  function renderSingleton(child: React.ReactNode) {
    return (
      <Tr>
        <Td colSpan={visibleFields.length}>
          <Center>{child}</Center>
        </Td>
      </Tr>
    )
  }

  function renderRow(item: T, index: number) {
    return (
      <Tr key={getKey(item, index)}>
        {visibleFields.map(field => (
          <Td key={field.key}>{field.render(item, index)}</Td>
        ))}
      </Tr>
    )
  }

  function renderShowMore() {
    if (displayAll) return

    if (data.length <= defaultLineCount) return

    return renderSingleton(
      <Button variant="unstyled" onClick={() => setDisplayAll(true)}>
        Show more
      </Button>,
    )
  }

  function renderLoadingMore() {
    if (!hasMore) return

    return renderSingleton(
      <InView style={{ width: '100%' }} onChange={inView => inView && onMore?.()}>
        {skeleton || <SkeletonText w="100%" noOfLines={2} />}
      </InView>,
    )
  }

  function renderRows() {
    if (data.length === 0) {
      if (isLoading) return renderSingleton(skeleton || <SkeletonText w="100%" noOfLines={2} />)
      else return renderSingleton(<Text>{empty || 'No data'}</Text>)
    }

    if (displayAll) return data.map(renderRow)

    return data.slice(0, defaultLineCount).map(renderRow)
  }

  return (
    <Table {...props}>
      <Thead>
        <Tr>{visibleFields.map(renderColumnName)}</Tr>
      </Thead>
      <Tbody>
        {renderRows()}
        {onMore ? renderLoadingMore() : renderShowMore()}
      </Tbody>
    </Table>
  )
}
