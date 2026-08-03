package br.com.dominiolubrificantes.api.repository;

import br.com.dominiolubrificantes.api.entity.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {

    // Buscar histórico de um produto específico ordenado pelo mais recente
    List<MovimentacaoEstoque> findByProdutoIdOrderByDataMovimentacaoDesc(Long produtoId);

    // Listar todo o histórico ordenado por data descendente
    List<MovimentacaoEstoque> findAllByOrderByDataMovimentacaoDesc();
}