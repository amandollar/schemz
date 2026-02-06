package com.schemz.server.controller;

import com.schemz.server.model.Scheme;
import com.schemz.server.service.SchemeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private SchemeService schemeService;

    @PostMapping("/scheme")
    public ResponseEntity<Scheme> createScheme(@RequestBody Scheme scheme) {
        return ResponseEntity.ok(schemeService.createScheme(scheme));
    }

    @PostMapping("/scheme/{id}/publish")
    public ResponseEntity<Scheme> publishScheme(@PathVariable Long id) {
        return ResponseEntity.ok(schemeService.publishScheme(id));
    }

    @GetMapping("/schemes")
    public ResponseEntity<java.util.List<Scheme>> getAllSchemes() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }
    
    // Additional endpoints (edit, delete) can be added here
}
