package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.entity.MovimentacaoEstoque;
import br.com.dominiolubrificantes.api.repository.MovimentacaoEstoqueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MovimentacaoEstoqueController {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    // Listar todo o histórico de entradas e saídas
    @GetMapping
    public ResponseEntity<List<MovimentacaoEstoque>> listarTodas() {
        return ResponseEntity.ok(movimentacaoRepository.findAllByOrderByDataMovimentacaoDesc());
    }

    // Listar extrato de um produto específico por ID
    @GetMapping("/produto/{produtoId}")
    public ResponseEntity<List<MovimentacaoEstoque>> listarPorProduto(@PathVariable Long produtoId) {
        return ResponseEntity.ok(movimentacaoRepository.findByProdutoIdOrderByDataMovimentacaoDesc(produtoId));
    }
}