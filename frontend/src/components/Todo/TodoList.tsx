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
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  editTodo: (id: string, newName: string) => void;
  setTodos: React.Dispatch<React.SetStateAction<TodoType[]>>;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  toggleTodo,
  deleteTodo,
  editTodo,
  setTodos,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newTodos = Array.from(todos);
    const [moved] = newTodos.splice(result.source.index, 1);
    newTodos.splice(result.destination.index, 0, moved);
    setTodos(newTodos);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided: DroppableProvided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2 mt-4"
          >
            {todos.map((todo, index) => (
              <Draggable
                key={todo.id}
                draggableId={todo.id}
                index={index}
              >
                {(provided: DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Todo
                      todo={todo}
                      toggleTodo={toggleTodo}
                      deleteTodo={deleteTodo}
                      editTodo={editTodo}
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
