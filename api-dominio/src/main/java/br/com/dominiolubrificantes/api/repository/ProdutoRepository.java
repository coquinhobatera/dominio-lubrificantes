package br.com.dominiolubrificantes.api.repository;

import br.com.dominiolubrificantes.api.entity.Produto;
import br.com.dominiolubrificantes.api.entity.TipoProduto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findByTipo(TipoProduto tipo);

    // Busca produtos que estão com saldo menor ou igual ao estoque mínimo
    @Query("SELECT p FROM Produto p WHERE p.quantidadeEstoque <= p.estoqueMinimo")
    List<Produto> findProdutosComEstoqueBaixo();
}