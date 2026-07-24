"use client";

import { deleteEvent } from "./actions";

export function DeleteEventButton({
  id,
  message = "¿Eliminar este evento?",
  label = "Eliminar",
  className,
}: {
  id: string;
  message?: string;
  label?: string;
  className?: string;
}) {
  return (
    <form action={deleteEvent}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={className}
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault();
        }}
      >
        {label}
      </button>
    </form>
  );
}
