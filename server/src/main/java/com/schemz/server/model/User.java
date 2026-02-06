package com.schemz.server.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password; // hashed

    private Integer age;
    private Double income;
    private String category; // e.g., GEN, OBC, SC, ST
    private String education;
    private String gender; // M, F, O
    private String state;
    private Boolean disability;
    private String occupation;
    
    // New Indian Context Fields
    private String maritalStatus; // Single, Married, Widowed, Divorced
    private String residenceType; // Urban, Rural
    private String employmentType; // Government, Private, Self-Employed, Unemployed, Student
    private Boolean bplStatus; // Below Poverty Line

    // Role: USER, ADMIN
    private String role;
}
