package com.fitlog.backend.controller;

import com.fitlog.backend.model.WorkoutLog;
import com.fitlog.backend.service.WorkoutLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "*")
public class WorkoutLogController {

    @Autowired
    private WorkoutLogService workoutLogService;

    @GetMapping
    public ResponseEntity<List<WorkoutLog>> getAllLogs() {
        return ResponseEntity.ok(workoutLogService.getAllLogs());
    }

    @PostMapping
    public ResponseEntity<WorkoutLog> createLog(@RequestBody WorkoutLog log) {
        WorkoutLog savedLog = workoutLogService.saveLog(log);
        return ResponseEntity.ok(savedLog);
    }
}