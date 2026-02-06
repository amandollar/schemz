package com.schemz.server;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schemz.server.dto.AuthRequest;
import com.schemz.server.dto.AuthResponse;
import com.schemz.server.model.Rule;
import com.schemz.server.model.Scheme;
import com.schemz.server.model.User;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class SchemzIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String adminToken;
    private static String userToken;
    private static Long schemeId;
    private static Long userId;

    @Test
    @Order(1)
    public void testRegisterAdmin() throws Exception {
        User admin = new User();
        admin.setName("Admin User");
        admin.setEmail("admin@schemz.com");
        admin.setPassword("adminpass");
        admin.setRole("ADMIN");
        admin.setAge(30);
        admin.setIncome(1000000.0);
        admin.setCategory("GEN");
        admin.setEducation("PhD");
        admin.setGender("M");
        admin.setState("Delhi");
        admin.setDisability(false);
        admin.setOccupation("Admin");
        admin.setMaritalStatus("Single");
        admin.setResidenceType("Urban");
        admin.setEmploymentType("Government");
        admin.setBplStatus(false);

        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(admin)))
                .andExpect(status().isOk());
    }

    @Test
    @Order(2)
    public void testLoginAdmin() throws Exception {
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("admin@schemz.com");
        loginRequest.setPassword("adminpass");

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(response, AuthResponse.class);
        adminToken = authResponse.getToken();
    }

    @Test
    @Order(3)
    public void testCreateScheme() throws Exception {
        Scheme scheme = new Scheme();
        scheme.setName("Youth Skill Scheme");
        scheme.setDescription("Skill development for youth");
        scheme.setBenefits("Free Training");
        scheme.setMinistry("Skill India");
        scheme.setActive(false);

        List<Rule> rules = new ArrayList<>();
        
        Rule rule1 = new Rule();
        rule1.setField("income");
        rule1.setOperator("<");
        rule1.setValue("300000");
        rule1.setWeight(50);
        
        Rule rule2 = new Rule();
        rule2.setField("age");
        rule2.setOperator("<=");
        rule2.setValue("30");
        rule2.setWeight(50);

        rules.add(rule1);
        rules.add(rule2);
        scheme.setRules(rules);

        MvcResult result = mockMvc.perform(post("/admin/scheme")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(scheme)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Youth Skill Scheme"))
                .andReturn();
        
        String response = result.getResponse().getContentAsString();
        Scheme createdScheme = objectMapper.readValue(response, Scheme.class);
        schemeId = createdScheme.getId();
    }

    @Test
    @Order(4)
    public void testPublishScheme() throws Exception {
        mockMvc.perform(post("/admin/scheme/" + schemeId + "/publish")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(true));
    }

    @Test
    @Order(5)
    public void testRegisterUser() throws Exception {
        User user = new User();
        user.setName("Eligible Student");
        user.setEmail("student@schemz.com");
        user.setPassword("userpass");
        user.setRole("USER");
        // Eligible attributes
        user.setAge(22);
        user.setIncome(150000.0);
        user.setCategory("OBC");
        user.setEducation("12th");
        user.setGender("M");
        user.setState("Maharashtra");
        user.setDisability(false);
        user.setOccupation("Student");
        user.setMaritalStatus("Single");
        user.setResidenceType("Rural");
        user.setEmploymentType("Student");
        user.setBplStatus(true);

        MvcResult result = mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(user)))
                .andExpect(status().isOk())
                .andReturn();
    }

    @Test
    @Order(6)
    public void testLoginUser() throws Exception {
        AuthRequest loginRequest = new AuthRequest();
        loginRequest.setEmail("student@schemz.com");
        loginRequest.setPassword("userpass");

        MvcResult result = mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String response = result.getResponse().getContentAsString();
        AuthResponse authResponse = objectMapper.readValue(response, AuthResponse.class);
        userToken = authResponse.getToken();
        userId = authResponse.getId();
    }

    @Test
    @Order(7)
    public void testCheckEligibility() throws Exception {
        mockMvc.perform(get("/schemes/match")
                .param("userId", String.valueOf(userId))
                .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].scheme.name").value("Youth Skill Scheme"))
                .andExpect(jsonPath("$[0].matchPercentage").value(100));
    }
}
