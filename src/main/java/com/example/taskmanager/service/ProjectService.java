package com.example.taskmanager.service;

import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public Page<Project> getAllProjects(User user, int page, int size){
        Pageable pageable = PageRequest.of(page, size);
        return projectRepository.findByUser(user, pageable);
    }

    public Project getProjectById(Long id, User user){

        Project project = projectRepository.findById(id).orElseThrow(
                ()-> new RuntimeException("Project with id: "+id+" not found or does not exist.")
        );
        if(!project.getUser().getId().equals(user.getId())){
            throw new RuntimeException("Access denied, this project does not belong to you!");
        }
        return project;
    }

    public Project createProject(Project project, User user){
        project.setUser(user);
        return projectRepository.save(project);
    }

    public void deleteProject(Long id, User user){
        Project project =getProjectById(id,user);
        projectRepository.delete(project);
    }
}
