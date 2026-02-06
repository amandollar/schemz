package com.schemz.server.service;

import com.schemz.server.model.Scheme;
import com.schemz.server.model.User;
import com.schemz.server.repository.SchemeRepository;
import com.schemz.server.repository.UserRepository;
import com.schemz.server.service.EligibilityEngine.SchemeMatch;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchemeService {

    @Autowired
    private SchemeRepository schemeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EligibilityEngine eligibilityEngine;

    public Scheme createScheme(Scheme scheme) {
        return schemeRepository.save(scheme);
    }

    public List<Scheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public Scheme getSchemeById(Long id) {
        return schemeRepository.findById(id).orElseThrow(() -> new RuntimeException("Scheme not found"));
    }

    public Scheme publishScheme(Long id) {
        Scheme scheme = getSchemeById(id);
        scheme.setActive(true);
        return schemeRepository.save(scheme);
    }

    public List<SchemeMatch> getMatchingSchemesForUser(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        List<Scheme> activeSchemes = schemeRepository.findByActiveTrue();
        return eligibilityEngine.matchSchemes(user, activeSchemes);
    }
}
