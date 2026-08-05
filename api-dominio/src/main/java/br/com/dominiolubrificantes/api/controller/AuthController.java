package br.com.dominiolubrificantes.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import br.com.dominiolubrificantes.api.entity.Usuario;
import br.com.dominiolubrificantes.api.repository.UsuarioRepository;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> fazerLogin(@RequestBody Usuario login) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(login.getUsername());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            // Validação da senha (em produção, use BCrypt para comparar hashes)
            if (usuario.getSenha().equals(login.getSenha())) {
                return ResponseEntity.ok(new RespostaLogin("AUTORIZADO", usuario.getUsername(), usuario.getPerfil()));
            }
        }

        return ResponseEntity.status(401).body("Usuário ou senha inválidos.");
    }

    @PostMapping("/registrar")
    public ResponseEntity<?> registrarUsuario(@RequestBody Usuario novoUsuario) {
        try {
            if (usuarioRepository.findByUsername(novoUsuario.getUsername()).isPresent()) {
                return ResponseEntity.badRequest().body("Erro: Este nome de usuário já está em uso.");
            }

            usuarioRepository.save(novoUsuario);
            return ResponseEntity.ok("Usuário cadastrado com sucesso!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao cadastrar usuário: " + e.getMessage());
        }
    }

    public record RespostaLogin(String status, String nomeUsuario, String perfil) {}
}