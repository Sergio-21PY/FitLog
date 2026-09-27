package com.fitlog.backend.service;

import com.fitlog.backend.model.Exercise;
import com.fitlog.backend.repository.ExerciseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExerciseService {

    @Autowired
    private ExerciseRepository exerciseRepository;

    public List<Exercise> getAllExercises() {
        return exerciseRepository.findAll();
    }

    public Exercise createExercise(Exercise exercise) {
        return exerciseRepository.save(exercise);
    }

    // Método para eliminar un ejercicio por su ID
    public void deleteExercise(Long id) {
        exerciseRepository.deleteById(id);
    }
}