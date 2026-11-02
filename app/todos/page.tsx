import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";

async function TodoList() {
  const supabase = await createClient();
  const { data: todos, error } = await supabase.from("todos").select();

  if (error) {
    console.error("Supabase todos query failed:", {
      code: error.code,
      message: error.message,
    });

    return (
      <main>
        <h1>Todos</h1>
        <p role="alert">
          The todo list is unavailable. Check the Supabase table and Data API access.
        </p>
      </main>
    );
  }

  return (
    <main>
      <h1>Todos</h1>
      {todos?.length ? (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))}
        </ul>
      ) : (
        <p>No todos yet.</p>
      )}
    </main>
  );
}

export default function TodosPage() {
  return (
    <Suspense fallback={<p>Loading todos...</p>}>
      <TodoList />
    </Suspense>
  );
}