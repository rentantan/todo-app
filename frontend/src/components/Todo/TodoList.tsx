import React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { Category, TodoInput, TodoType } from '../../types';
import Todo from './Todo';

interface TodoListProps {
  todos: TodoType[];
  categories: Category[];
  isLoading: boolean;
  /** フィルター中は部分的な並び替えで順序が壊れるため、ドラッグを無効にする */
  canReorder: boolean;
  hasFilters: boolean;
  onReorder: (todos: TodoType[]) => void;
  onToggle: (todo: TodoType) => void;
  onUpdate: (id: string, data: Partial<TodoInput>) => Promise<boolean>;
  onDelete: (todo: TodoType) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos, categories, isLoading, canReorder, hasFilters, onReorder, onToggle, onUpdate, onDelete,
}) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = Array.from(todos);
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onReorder(next);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{hasFilters ? '🔍' : '🎉'}</div>
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
          {hasFilters ? '条件に一致するタスクがありません' : 'タスクがありません'}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {hasFilters ? 'フィルターを変更してみてください。' : '新しいタスクを追加して始めましょう！'}
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="todos">
        {(provided) => (
          <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
            {todos.map((todo, index) => (
              <Draggable key={todo.id} draggableId={todo.id} index={index} isDragDisabled={!canReorder}>
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={snapshot.isDragging ? 'shadow-xl rounded-lg' : ''}
                  >
                    <Todo
                      todo={todo}
                      categories={categories}
                      dragHandleProps={canReorder ? provided.dragHandleProps : null}
                      onToggle={onToggle}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default TodoList;
