package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.dto.MovimentacaoEstoqueDTO;
import br.com.dominiolubrificantes.api.entity.Produto;
import br.com.dominiolubrificantes.api.entity.TipoProduto;
import br.com.dominiolubrificantes.api.repository.ProdutoRepository;
import br.com.dominiolubrificantes.api.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProdutoController {

    private final ProdutoService produtoService;
    private final ProdutoRepository produtoRepository;

    // Listar todos os produtos do estoque
    @GetMapping
    public ResponseEntity<List<Produto>> listarTodos() {
        return ResponseEntity.ok(produtoRepository.findAll());
    }

    // Buscar produto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Produto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    // Listar produtos filtrados por tipo (ex: OLEO, FILTRO_OLEO)
    @GetMapping("/tipo/{tipo}")
    public ResponseEntity<List<Produto>> listarPorTipo(@PathVariable TipoProduto tipo) {
        return ResponseEntity.ok(produtoRepository.findByTipo(tipo));
    }

    // Listar produtos que estão com estoque crítico
    @GetMapping("/estoque-baixo")
    public ResponseEntity<List<Produto>> listarEstoqueBaixo() {
        return ResponseEntity.ok(produtoService.listarProdutosComEstoqueBaixo());
    }

    // Cadastrar novo produto no estoque
    @PostMapping
    public ResponseEntity<Produto> cadastrar(@RequestBody Produto produto) {
        Produto novoProduto = produtoRepository.save(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novoProduto);
    }

    // Entrada de produtos no estoque (compras/reposição)
    @PostMapping("/entrada")
    public ResponseEntity<Produto> darEntrada(@RequestBody @Valid MovimentacaoEstoqueDTO dto) {
        Produto produtoAtualizado = produtoService.darEntrada(dto);
        return ResponseEntity.ok(produtoAtualizado);
    }
}