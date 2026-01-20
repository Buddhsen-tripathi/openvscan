'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Project } from '@openvscan/types';
import Link from 'next/link';

export function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data } = await api.projects.list();
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (isLoading) {
    return <div className="text-center py-10">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
        <p className="mt-1 text-gray-500">Get started by creating a new project.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/dashboard/projects/${project.id}`}
          className="block bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">{project.name}</h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2">
            {project.description || 'No description provided'}
          </p>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
            {/* We could show last scan status here if we fetch it */}
          </div>
        </Link>
      ))}
    </div>
  );
}
