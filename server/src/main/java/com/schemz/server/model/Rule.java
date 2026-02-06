package com.schemz.server.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "eligibility_rules")
public class Rule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String field;    // e.g., "income"
    private String operator; // e.g., "<=", ">", "==", "IN"
    private String value;    // e.g., "250000", "Maharashtra"
    private Integer weight;  // e.g., 25
}
