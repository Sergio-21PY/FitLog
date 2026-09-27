package com.fitlog.backend.service;

import com.fitlog.backend.model.WorkoutLog;
import com.fitlog.backend.repository.WorkoutLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutLogService {

    @Autowired
    private WorkoutLogRepository workoutLogRepository;

    public List<WorkoutLog> getAllLogs() {
        return workoutLogRepository.findAll();
    }

    public WorkoutLog saveLog(WorkoutLog log) {
        return workoutLogRepository.save(log);
    }
}