"use client";

import { Plus, X } from "lucide-react";
import { type FormEvent, useState } from "react";
import { useCreateProjectMutation } from "@/lib/api";

export function CreateProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createProject = useCreateProjectMutation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createProject.mutateAsync({ name, description });
      setIsOpen(false);
      setName("");
      setDescription("");
    } catch {
      alert("Failed to create project");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors text-sm"
      >
        <Plus size={16} />
        New Project
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 w-full max-w-md border border-border/60 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-card-foreground">
                Create Project
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="project-name"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Project Name
                </label>
                <input
                  id="project-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 transition-all"
                  placeholder="My Web App"
                />
              </div>
              <div className="mb-6">
                <label
                  htmlFor="project-description"
                  className="block text-sm font-medium text-muted-foreground mb-1.5"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50 transition-all resize-none"
                  placeholder="Security scans for..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProject.isPending}
                  className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                >
                  {createProject.isPending ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
