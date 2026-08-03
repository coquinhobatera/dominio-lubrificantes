package br.com.dominiolubrificantes.api.repository;

import br.com.dominiolubrificantes.api.entity.Veiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VeiculoRepository extends JpaRepository<Veiculo, String> {

    // Método customizado para buscar ignorando maiúsculas/minúsculas (ex: "abc1d23" ou "ABC1D23")
    Optional<Veiculo> findByPlacaIgnoreCase(String placa);

}