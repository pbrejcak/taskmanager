package com.example.taskmanager.controller;

import com.example.taskmanager.model.Project;
import com.example.taskmanager.model.User;
import com.example.taskmanager.repository.UserRepository;
import com.example.taskmanager.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;


@RestController
@CrossOrigin
@RequestMapping("/api/projects")

public class ProjectController {
    private final ProjectService projectService;
    private final UserRepository userRepository;

    public ProjectController(ProjectService projectService, UserRepository userRepository) {
        this.projectService = projectService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("Logged user was not found in the database."));
    }

    @GetMapping
    public ResponseEntity<Page<Project>> getAllProjects(Principal principal, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.getAllProjects(user,page,size));
    }

    @GetMapping("/{id}")
    public ResponseEntity< Project> getProjectById (@PathVariable Long id, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.getProjectById(id,user));
    }


    @PostMapping
    public ResponseEntity<Project> createProject(@RequestBody Project project, Principal principal){
        User user = getAuthenticatedUser(principal);
        return ResponseEntity.ok(projectService.createProject(project,user));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id, Principal principal){
        User user = getAuthenticatedUser(principal);
        projectService.deleteProject(id,user);
        return ResponseEntity.noContent().build();
    }
}
