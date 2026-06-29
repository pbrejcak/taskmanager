package com.example.taskmanager.service;

import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service

public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectService projectService;

    public TaskService(TaskRepository taskRepository, ProjectService projectService) {
        this.taskRepository = taskRepository;
        this.projectService = projectService;
    }

    public List<Task> getTasksByProjectId(Long projectId, User user){
        Project project = projectService.getProjectById(projectId,user);
        return project.getTasks();
    }
    //??
    public Task getTaskById (Long id, User user){
        Task task = taskRepository.findById(id).orElseThrow(
                ()->new RuntimeException("Task was not found :(")
        );
        if(!task.getProject().getUser().getId().equals(user.getId()))
            throw new RuntimeException("This task does not belong to you!");
        return task;
    }

    public Task toggleTaskCompletion (Long taskId, User user){
        Task task = getTaskById(taskId, user);
        return taskRepository.save(task);
    }

    public Task createTask(Long projectId, Task task, User user){
        Project project = projectService.getProjectById(projectId,user);
        task.setProject(project);
        return taskRepository.save(task);
    }

    public void deleteTask(Long id, User user){
        Task task = taskRepository.findById(id).orElseThrow(()-> new RuntimeException("Task was not found!"));
        if(!task.getProject().getUser().getId().equals(user.getId()))
            throw new RuntimeException("This task does not belong to you");
        taskRepository.delete(task);
    }
    public Task saveTask(Task task) {
        return taskRepository.save(task);
    }
}
