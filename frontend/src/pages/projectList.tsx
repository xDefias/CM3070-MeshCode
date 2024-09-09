import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '@/utils/axios';
import { API_LIST } from '@/constants/api';
import { useAuth } from '@/contexts/authContext';
import { Project } from '@/types/project';
import { Table } from '@/components/ui/table';
import CreateProjectModal from '@/components/modal/createProjectModal';
import EditProjectModal from '@/components/modal/editProjectModal';
import ConfirmationModal from '@/components/modal/confirmationModal';
import { Button } from '@/components/ui/button';

const ProjectList = () => {
  const { authState } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteproject_id, setDeleteproject_id] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState) {
      fetchProjects(authState.userId);
    }
  }, [authState]);

  const fetchProjects = async (userId: string) => {
    try {
      const response = await axiosInstance.get<{ data: { projects: Project[] } }>(API_LIST.GET_PROJECTS, {
        params: { userId },
      });
      //console.log("fetch projects response:", response);
      setProjects(response.data.data.projects || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch projects', error);
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    if (authState) {
      fetchProjects(authState.userId);
    }
  };

  const handleEditProject = () => {
    if (authState) {
      fetchProjects(authState.userId);
    }
  };

  const handleDeleteProject = async () => {
    if (deleteproject_id === null) return;
    //console.log('Deleting project with ID:', deleteproject_id); // Debugging statement
    try {
      await axiosInstance.delete(API_LIST.DELETE_PROJECT(deleteproject_id));
      if (authState) {
        fetchProjects(authState.userId);
      }
      setDeleteproject_id(null);
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const headers = ["Name", "Description", "Actions"];

  const data = projects.map(project => ({
    Name: (
      <button onClick={() => navigate(`/projects/${project.id}`)} className="text-blue-500 underline">
        {project.name}
      </button>
    ),
    Description: project.description,
    Actions: (
      <div className="flex space-x-2">
        <Button variant="submission" onClick={() => { setEditProject(project); setIsEditModalOpen(true); }}>Edit</Button>
        <Button variant="submission" onClick={() => { setDeleteproject_id(project.id); setIsDeleteModalOpen(true); }}>Delete</Button>
      </div>
    ),
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Projects</h1>
      <Button variant="submission" onClick={() => setIsCreateModalOpen(true)} className="mb-4">
        Create Project
      </Button>
      <Table headers={headers} data={data} />
      <CreateProjectModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreate={handleCreateProject}
      />
      <EditProjectModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        project={editProject}
        onEdit={handleEditProject}
      />
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleDeleteProject}
        title="Confirm Deletion"
        message="Are you sure you want to delete this project?"
        confirmButtonLabel="Delete"
        cancelButtonLabel="Cancel"
      />
    </div>
  );
};

export default ProjectList;
