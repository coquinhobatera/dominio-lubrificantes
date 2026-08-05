package br.com.dominiolubrificantes.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import br.com.dominiolubrificantes.api.entity.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);
}