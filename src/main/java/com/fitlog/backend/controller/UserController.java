package com.fitlog.backend.controller;

import com.fitlog.backend.model.User;
import com.fitlog.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController{

    @Autowired
    private UserService userService;
    @Autowired
    private com.fitlog.backend.security.JwtUtil jwtUtil;

    @GetMapping
    public List<User> getAllUsers(){
        return userService.getAllUsers();
    }

    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody User user) {
        User savedUser = userService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
        Optional<User> userOpt = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Generamos el token JWT basado en su email
            String token = jwtUtil.generateToken(user.getEmail());

            // Creamos una respuesta que incluya el token y los datos del usuario
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Credenciales incorrectas: email o contraseña inválidos.");
        }
    }

}
