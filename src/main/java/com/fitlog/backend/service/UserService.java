package com.fitlog.backend.service;

import com.fitlog.backend.model.User;
import com.fitlog.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers (){
        return userRepository.findAll();
    }

    public User registerUser(User user) {
        // Aquí luego agregaremos la lógica para encriptar la contraseña
        return userRepository.save(user);
    }

    public Optional<User> loginUser(String email, String password){
        return userRepository.findByEmailAndPassword(email,password);
    }
}
