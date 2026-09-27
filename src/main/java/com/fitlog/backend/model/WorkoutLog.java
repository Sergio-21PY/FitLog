package com.fitlog.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "workout_logs")
@Data
public class WorkoutLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String exerciseName;

    @Column(nullable = false)
    private int setNumber;

    @Column(nullable = false)
    private double weight;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private String weekRange;
}