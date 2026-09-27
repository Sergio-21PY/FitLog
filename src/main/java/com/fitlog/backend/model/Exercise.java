package com.fitlog.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "exercises")
@Data
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String muscleGroup;

    @Column(nullable = false)
    private String repetitions;

    @Column(nullable = false)
    private String sets;

    @Column(nullable = false)
    private String restBetweenReps;

    @Column(nullable = false)
    private String restBetweenSets;

    @Column(nullable = false)
    private String week; // Ej: Semana 1

    @Column(nullable = false)
    private String day; // Ej: Lunes, Martes, Miércoles...
}