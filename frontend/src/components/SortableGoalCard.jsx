import { useSortable } from "@dnd-kit/sortable";
import { CSS }         from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import GoalCard from "./GoalCard";

export default function SortableGoalCard({ goal, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: goal.id });

  const wrapStyle = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.45 : 1,
    zIndex:     isDragging ? 999  : "auto",
    position:   "relative",
  };

  return (
    <div ref={setNodeRef} style={wrapStyle} className="sortable-card-wrapper">
      {/* Drag handle — sits in the top-left corner, visible on hover */}
      <div
        className="drag-handle"
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={15} />
      </div>

      <GoalCard goal={goal} {...props} />
    </div>
  );
}
