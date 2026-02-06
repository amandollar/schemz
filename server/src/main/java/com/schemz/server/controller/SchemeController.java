package com.schemz.server.controller;

import com.schemz.server.service.EligibilityEngine.SchemeMatch;
import com.schemz.server.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schemes")
@CrossOrigin(origins = "*")
public class SchemeController {

    @Autowired
    private SchemeService schemeService;

    @GetMapping("/match")
    public ResponseEntity<List<SchemeMatch>> getMatchingSchemes(@RequestParam Long userId) {
        // In a real app, userId should probably come from the JWT token claims to prevent checking others' eligibility
        // For now, following the simple plan parameters
        List<SchemeMatch> matches = schemeService.getMatchingSchemesForUser(userId);
        return ResponseEntity.ok(matches);
    }
}
