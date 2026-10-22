
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateThread,
  deleteThread,
} from "../services/threads.service";

export default function ThreadItem({ thread }) {
  const [title, setTitle] = useState(thread.title);
  const [editing, setEditing] = useState(false);

  const queryClient = useQueryClient();

  // Edit mutation: update the thread using PUT
  const editMutation = useMutation({
    mutationFn: ({ id, data }) => updateThread(id, data),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
      queryClient.invalidateQueries({ queryKey: ["thread", id] });
      setEditing(false);
    },
  });

  // Delete mutation: delete the thread using DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    },
  });

  function handleSave() {
    editMutation.mutate({
      id: thread.id,
      data: { title },
    });
  }

  function handleDelete() {
    deleteMutation.mutate(thread.id);
  }

  if (editing) {
    return (
      <li className="card">
        <input
          className="edit-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="row">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={editMutation.isPending}
          >
            {editMutation.isPending ? "Saving..." : "Save"}
          </button>

          <button
            className="btn-ghost"
            disabled={editMutation.isPending}
            onClick={() => {
              setTitle(thread.title);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>

        {editMutation.isError && (
          <p role="alert">
            Failed to save changes. Please try again.
          </p>
        )}
      </li>
    );
  }

  return (
    <li className="card">
      <h3>{thread.title}</h3>
      <p>{thread.body}</p>

      <div className="row">
        <button
          className="btn-ghost"
          onClick={() => {
            setTitle(thread.title);
            setEditing(true);
          }}
        >
          Edit
        </button>

        <button
          className="btn-danger"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete"}
        </button>
      </div>

      {deleteMutation.isError && (
        <p role="alert">
          Failed to delete the thread. Please try again.
        </p>
      )}
    </li>
  );
}
