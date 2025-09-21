import React from "react";
import Todo from "./Todo";
import { TodoType } from "../../types";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggableProvided,
  DroppableProvided,
} from "@hello-pangea/dnd";

interface TodoListProps {
  todos: TodoType[];
  onReorder: (todos: TodoType[]) => void;
  onTodoUpdated: () => void;
  isLoading?: boolean;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onReorder,
  onTodoUpdated,
  isLoading = false
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newTodos = Array.from(todos);
    const [moved] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, moved);
    
    onReorder(newTodos);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 mt-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-600 mb-2">タスクがありません</h3>
        <p className="text-gray-500">新しいタスクを追加して始めましょう！</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3 mt-6"
          >
            {todos.map((todo, index) => (
              <Draggable
                key={todo.id}
                draggableId={todo.id}
                index={index}
              >
                {(provided: DraggableProvided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transform transition-transform ${
                      snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : ''
                    }`}
                  >
                    <Todo
                      todo={todo}
                      onTodoUpdated={onTodoUpdated}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TodoList;