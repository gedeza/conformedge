"use client"

import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface SortableItem {
  id: string
  [key: string]: unknown
}

interface SortableStepsProps<T extends SortableItem> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (
    item: T,
    index: number,
    dragHandle: React.ReactNode
  ) => React.ReactNode
  className?: string
}

function SortableItemWrapper<T extends SortableItem>({
  item,
  index,
  renderItem,
}: {
  item: T
  index: number
  renderItem: SortableStepsProps<T>["renderItem"]
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const dragHandle = (
    <button
      type="button"
      className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none"
      aria-label="Drag to reorder"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  )

  return (
    <div ref={setNodeRef} style={style}>
      {renderItem(item, index, dragHandle)}
    </div>
  )
}

export function SortableSteps<T extends SortableItem>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableStepsProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === String(active.id))
    const newIndex = items.findIndex((i) => i.id === String(over.id))
    onReorder(arrayMove(items, oldIndex, newIndex))
  }

  const activeItem = activeId ? items.find((i) => i.id === activeId) : null
  const activeIndex = activeItem ? items.indexOf(activeItem) : -1

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("space-y-2", className)}>
          {items.map((item, index) => (
            <SortableItemWrapper
              key={item.id}
              item={item}
              index={index}
              renderItem={renderItem}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="opacity-90 shadow-lg rounded-md">
            {renderItem(activeItem, activeIndex, (
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            ))}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
