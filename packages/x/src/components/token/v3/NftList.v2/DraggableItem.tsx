import { useDrag } from 'react-dnd'

import SimpleNftCard, { SimpleNftCardProps } from '../SimpleNftCard'

export interface DraggableItemProps extends SimpleNftCardProps {
  type?: string | symbol
  disabled?: boolean
}

export default function DraggableItem({ type = 'nft', item, disabled, ...props }: DraggableItemProps) {
  const [{ isDragging }, ref] = useDrag({
    type,
    item,
    canDrag: !disabled,
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  })

  return <SimpleNftCard ref={ref} opacity={isDragging ? 0.6 : props.opacity} item={item} {...props} />
}
