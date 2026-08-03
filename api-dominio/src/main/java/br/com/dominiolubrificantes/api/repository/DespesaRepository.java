package br.com.dominiolubrificantes.api.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import br.com.dominiolubrificantes.api.entity.Despesa;


@Repository
public interface DespesaRepository extends JpaRepository<Despesa, Long> {
    
    // Busca todas as contas filtrando pela data de vencimento e status
    List<Despesa> findByDataVencimentoAndStatus(LocalDate data, String status);
    
    // Opcional: Busca tudo que está PENDENTE, independente da data (para listar atrasados)
    List<Despesa> findByStatus(String status);
}