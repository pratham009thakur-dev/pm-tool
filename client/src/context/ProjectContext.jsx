import React, { createContext, useContext, useState, useCallback } from 'react';
import { getProjectsApi, getProjectByIdApi } from '../services/projectService';

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      const data = await getProjectsApi();
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const selectProject = useCallback(async (id) => {
    setLoadingProjects(true);
    try {
      const data = await getProjectByIdApi(id);
      setCurrentProject(data);
      return data;
    } catch (err) {
      console.error('Failed to load project details', err);
      setCurrentProject(null);
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        loadingProjects,
        fetchProjects,
        selectProject,
        setCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);