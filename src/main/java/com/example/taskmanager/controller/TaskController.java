package com.example.taskmanager.controller;

import com.example.taskmanager.model.Status;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.webmvc.autoconfigure.WebMvcProperties;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@CrossOrigin
@RequestMapping("/api/tasks")

public class TaskController {
    private final TaskService taskService;
    private final UserRepository userRepository;

    public TaskController(TaskService taskService, UserRepository userRepository) {
        this.taskService = taskService;
        this.userRepository = userRepository;
    }
    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Logged user not found in the database."));
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(taskService.getTasksByProjectId(projectId,user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById (@PathVariable Long id, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(taskService.getTaskById(id,user));
    }

    @PostMapping("/project/{projectId}")
    public ResponseEntity<Task> createTask(@PathVariable Long projectId,@RequestBody Task task, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(taskService.createTask(projectId,task,user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Principal principal){
        User user = getAuthenticatedUser(principal);
        taskService.deleteTask(id,user);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask (@PathVariable Long id, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(taskService.toggleTaskCompletion(id,user));
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<Task> updateTaskStatus(@PathVariable Long id, @RequestBody String newStatus, Principal principal){
        User user = getAuthenticatedUser(principal);
        Task task = taskService.getTaskById(id, user);
        task.setStatus(Status.valueOf(newStatus.replace("\"", "")));

        return ResponseEntity.ok(taskService.saveTask(task));
    }
}
