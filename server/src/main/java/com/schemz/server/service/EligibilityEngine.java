package com.schemz.server.service;

import com.schemz.server.model.Rule;
import com.schemz.server.model.Scheme;
import com.schemz.server.model.User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EligibilityEngine {

    public List<SchemeMatch> matchSchemes(User user, List<Scheme> allSchemes) {
        return allSchemes.stream()
                .map(scheme -> evaluateScheme(user, scheme))
                .filter(match -> match.getMatchPercentage() > 0) // Filter out non-matching if strictly 0, or keep all
                .sorted((a, b) -> Integer.compare(b.getMatchPercentage(), a.getMatchPercentage())) // Descending sort
                .toList();
    }

    private SchemeMatch evaluateScheme(User user, Scheme scheme) {
        if (scheme.getRules() == null || scheme.getRules().isEmpty()) {
            return new SchemeMatch(scheme, 100); // No rules = everyone eligible? Or 0? Assuming 100 for now if public.
        }

        int totalWeight = scheme.getRules().stream().mapToInt(Rule::getWeight).sum();
        int matchedWeight = 0;

        for (Rule rule : scheme.getRules()) {
            if (evaluateRule(user, rule)) {
                matchedWeight += rule.getWeight();
            }
        }

        int matchPercentage = (totalWeight == 0) ? 0 : (int) (((double) matchedWeight / totalWeight) * 100);
        return new SchemeMatch(scheme, matchPercentage);
    }

    private boolean evaluateRule(User user, Rule rule) {
        Object userValue = getUserFieldValue(user, rule.getField());
        String operator = rule.getOperator();
        String ruleValue = rule.getValue();

        if (userValue == null) return false; // Fail if user data missing

        try {
            switch (operator) {
                case "==":
                case "EQUALS":
                    return String.valueOf(userValue).equalsIgnoreCase(ruleValue);
                case "!=":
                case "NOT_EQUALS":
                    return !String.valueOf(userValue).equalsIgnoreCase(ruleValue);
                case ">":
                    return Double.parseDouble(userValue.toString()) > Double.parseDouble(ruleValue);
                case ">=":
                    return Double.parseDouble(userValue.toString()) >= Double.parseDouble(ruleValue);
                case "<":
                    return Double.parseDouble(userValue.toString()) < Double.parseDouble(ruleValue);
                case "<=":
                    return Double.parseDouble(userValue.toString()) <= Double.parseDouble(ruleValue);
                case "IN":
                    // Rule value might be "A,B,C"
                    String[] options = ruleValue.split(",");
                    for (String opt : options) {
                        if (opt.trim().equalsIgnoreCase(String.valueOf(userValue))) return true;
                    }
                    return false;
                default:
                    return false;
            }
        } catch (Exception e) {
            // Log error or handle type mismatch silently (fail rule)
            System.err.println("Error evaluating rule: " + rule + " for user value: " + userValue);
            return false;
        }
    }

    private Object getUserFieldValue(User user, String field) {
        switch (field.toLowerCase()) {
            case "age": return user.getAge();
            case "income": return user.getIncome();
            case "category": return user.getCategory();
            case "education": return user.getEducation();
            case "gender": return user.getGender();
            case "state": return user.getState();
            case "disability": return user.getDisability();
            case "occupation": return user.getOccupation();
            case "maritalstatus": return user.getMaritalStatus();
            case "residencetype": return user.getResidenceType();
            case "employmenttype": return user.getEmploymentType();
            case "bplstatus": return user.getBplStatus();
            default: return null;
        }
    }

    // Helper class for result (could be a DTO/Record)
    public static class SchemeMatch {
        private Scheme scheme;
        private int matchPercentage;

        public SchemeMatch(Scheme scheme, int matchPercentage) {
            this.scheme = scheme;
            this.matchPercentage = matchPercentage;
        }

        public Scheme getScheme() { return scheme; }
        public int getMatchPercentage() { return matchPercentage; }
    }
}
