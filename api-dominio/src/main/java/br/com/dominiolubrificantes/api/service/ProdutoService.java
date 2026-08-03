package br.com.dominiolubrificantes.api.service;

import br.com.dominiolubrificantes.api.dto.MovimentacaoEstoqueDTO;
import br.com.dominiolubrificantes.api.entity.MovimentacaoEstoque;
import br.com.dominiolubrificantes.api.entity.Produto;
import br.com.dominiolubrificantes.api.entity.TipoMovimentacao;
import br.com.dominiolubrificantes.api.exception.ResourceNotFoundException;
import br.com.dominiolubrificantes.api.repository.MovimentacaoEstoqueRepository;
import br.com.dominiolubrificantes.api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;
    private final WhatsappService whatsappService;

    // Número do gerente/proprietário para receber alertas de estoque
    @Value("${oficina.whatsapp.gerente:5524992147851}")
    private String whatsappGerente;

    /**
     * Dá entrada de itens no estoque (reposição de compras / Nota Fiscal) e gera auditoria
     */
    @Transactional
    public Produto darEntrada(MovimentacaoEstoqueDTO dto) {
        Produto produto = buscarPorId(dto.getProdutoId());

        if (dto.getQuantidade() == null || dto.getQuantidade().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("A quantidade de entrada deve ser maior que zero.");
        }

        // Soma a quantidade ao estoque atual
        BigDecimal novoSaldo = produto.getQuantidadeEstoque().add(dto.getQuantidade());
        produto.setQuantidadeEstoque(novoSaldo);

        // Atualiza preço de custo se fornecido no DTO
        if (dto.getPrecoCustoUnitario() != null && dto.getPrecoCustoUnitario().compareTo(BigDecimal.ZERO) > 0) {
            produto.setPrecoCusto(dto.getPrecoCustoUnitario());
        }

        Produto produtoSalvo = produtoRepository.save(produto);

        // Registra o histórico de ENTRADA
        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .produto(produtoSalvo)
                .tipo(TipoMovimentacao.ENTRADA)
                .quantidade(dto.getQuantidade())
                .precoUnitario(dto.getPrecoCustoUnitario() != null ? dto.getPrecoCustoUnitario() : produtoSalvo.getPrecoCusto())
                .dataMovimentacao(LocalDateTime.now())
                .observacao(dto.getObservacao() != null ? dto.getObservacao() : "Entrada/Reposição de estoque")
                .build();

        movimentacaoEstoqueRepository.save(movimentacao);

        log.info("Entrada de estoque realizada! Produto: {} | +{} | Novo Saldo: {} | Obs: {}",
                produto.getNome(), dto.getQuantidade(), novoSaldo, dto.getObservacao());

        return produtoSalvo;
    }

    /**
     * Efetua a baixa de itens no estoque (utilizado na troca de óleo ou venda) e gera auditoria
     */
    @Transactional
    public Produto darBaixa(Long produtoId, BigDecimal quantidade) {
        return darBaixaComObservacao(produtoId, quantidade, "Baixa de estoque / Troca de óleo");
    }

    /**
     * Efetua a baixa de itens aceitando observação customizada (ex: placa do veículo)
     */
    @Transactional
    public Produto darBaixaComObservacao(Long produtoId, BigDecimal quantidade, String observacao) {
        Produto produto = buscarPorId(produtoId);

        if (quantidade == null || quantidade.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("A quantidade de baixa deve ser maior que zero.");
        }

        // Validação de saldo suficiente
        if (produto.getQuantidadeEstoque().compareTo(quantidade) < 0) {
            throw new IllegalStateException(String.format(
                "Saldo insuficiente para o produto '%s'. Estoque atual: %s, Solicitado: %s",
                produto.getNome(), produto.getQuantidadeEstoque(), quantidade
            ));
        }

        // Subtrai do saldo
        BigDecimal novoSaldo = produto.getQuantidadeEstoque().subtract(quantidade);
        produto.setQuantidadeEstoque(novoSaldo);

        Produto produtoAtualizado = produtoRepository.save(produto);

        // Registra o histórico de SAÍDA
        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .produto(produtoAtualizado)
                .tipo(TipoMovimentacao.SAIDA)
                .quantidade(quantidade)
                .precoUnitario(produtoAtualizado.getPrecoVenda())
                .dataMovimentacao(LocalDateTime.now())
                .observacao(observacao)
                .build();

        movimentacaoEstoqueRepository.save(movimentacao);

        log.info("Baixa de estoque realizada! Produto: {} | -{} | Saldo Atual: {}",
                produto.getNome(), quantidade, novoSaldo);

        // Dispara alerta se atingiu o estoque mínimo
        verificarEAlertarEstoqueBaixo(produtoAtualizado);

        return produtoAtualizado;
    }

    /**
     * Verifica e dispara alerta via WhatsApp se o produto atingiu o estoque mínimo
     */
    public void verificarEAlertarEstoqueBaixo(Produto produto) {
        if (produto.isEstoqueBaixo()) {
            log.warn("ATENÇÃO: Produto {} atingiu o estoque mínimo! (Saldo: {} | Mínimo: {})",
                    produto.getNome(), produto.getQuantidadeEstoque(), produto.getEstoqueMinimo());

            String mensagem = String.format(
                "🚨 *ALERTA DE ESTOQUE BAIXO - DOMÍNIO LUBRIFICANTES* 🛢️\n\n" +
                "O produto *%s* (Marca: %s) atingiu a quantidade crítica!\n\n" +
                "📦 *Estoque Atual:* %s\n" +
                "⚠️ *Estoque Mínimo:* %s\n\n" +
                "Recomendamos realizar o pedido de reposição com o fornecedor.",
                produto.getNome(),
                produto.getMarca() != null ? produto.getMarca() : "N/A",
                produto.getQuantidadeEstoque(),
                produto.getEstoqueMinimo()
            );

            try {
                whatsappService.enviarMensagemTexto(whatsappGerente, mensagem);
                log.info("Alerta de estoque baixo enviado para o gerente no WhatsApp ({})", whatsappGerente);
            } catch (Exception e) {
                log.error("Falha ao enviar alerta de estoque baixo via WhatsApp: {}", e.getMessage());
            }
        }
    }

    /**
     * Busca todos os produtos que estão com estoque crítico
     */
    @Transactional(readOnly = true)
    public List<Produto> listarProdutosComEstoqueBaixo() {
        return produtoRepository.findProdutosComEstoqueBaixo();
    }

    /**
     * Busca produto por ID ou lança exceção 404/Not Found
     */
    @Transactional(readOnly = true)
    public Produto buscarPorId(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com o ID: " + id));
    }
}