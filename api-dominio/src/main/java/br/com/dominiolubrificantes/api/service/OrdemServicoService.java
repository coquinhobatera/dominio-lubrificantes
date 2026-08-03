package br.com.dominiolubrificantes.api.service;

import br.com.dominiolubrificantes.api.dto.OrdemServicoDTO;
import br.com.dominiolubrificantes.api.entity.*;
import br.com.dominiolubrificantes.api.exception.ResourceNotFoundException;
import br.com.dominiolubrificantes.api.repository.OrdemServicoRepository;
import br.com.dominiolubrificantes.api.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrdemServicoService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final ProdutoRepository produtoRepository;
    private final ProdutoService produtoService;
    private final WhatsappService whatsappService;

    @Transactional
    public OrdemServico criarOrdemServico(OrdemServicoDTO dto) {
        OrdemServico os = OrdemServico.builder()
                .clienteNome(dto.getClienteNome())
                .clienteWhatsapp(dto.getClienteWhatsapp())
                .veiculoPlaca(dto.getVeiculoPlaca().toUpperCase().replaceAll("\\s+", ""))
                .veiculoModelo(dto.getVeiculoModelo())
                .veiculoKm(dto.getVeiculoKm())
                .formaPagamento(dto.getFormaPagamento())
                .observacoes(dto.getObservacoes())
                .status(StatusOrdemServico.ABERTA)
                .dataCriacao(LocalDateTime.now())
                .build();

        if (dto.getItens() != null) {
            for (OrdemServicoDTO.ItemOSRequest itemReq : dto.getItens()) {
                ItemOrdemServico item = new ItemOrdemServico();
                item.setQuantidade(itemReq.getQuantidade());

                if (itemReq.getProdutoId() != null) {
                    Produto produto = produtoService.buscarPorId(itemReq.getProdutoId());
                    item.setProduto(produto);
                    item.setPrecoUnitario(itemReq.getPrecoUnitario() != null ? itemReq.getPrecoUnitario() : produto.getPrecoVenda());
                } else {
                    item.setDescricaoServico(itemReq.getDescricaoServico());
                    item.setPrecoUnitario(itemReq.getPrecoUnitario());
                }

                item.calcularSubtotal();
                os.adicionarItem(item);
            }
        }

        os.calcularValorTotal();
        return ordemServicoRepository.save(os);
    }

    /**
     * Finaliza a OS, dá baixa automática nos produtos no estoque e notifica o cliente via WhatsApp
     */
    @Transactional
    public OrdemServico finalizarOrdemServico(Long id) {
        OrdemServico os = buscarPorId(id);

        if (os.getStatus() == StatusOrdemServico.CONCLUIDA) {
            throw new IllegalStateException("Esta Ordem de Serviço já foi concluída.");
        }

        // 1. Dar baixa automática nos produtos do estoque
        for (ItemOrdemServico item : os.getItens()) {
            if (item.getProduto() != null) {
                String obs = String.format("OS #%d - Veículo Placa: %s", os.getId(), os.getVeiculoPlaca());
                produtoService.darBaixaComObservacao(item.getProduto().getId(), item.getQuantidade(), obs);
            }
        }

        // 2. Atualizar status da OS
        os.setStatus(StatusOrdemServico.CONCLUIDA);
        os.setDataFinalizacao(LocalDateTime.now());
        OrdemServico osSalva = ordemServicoRepository.save(os);

        // 3. Enviar comprovante/notificação no WhatsApp do cliente se cadastrado
        if (os.getClienteWhatsapp() != null && !os.getClienteWhatsapp().isBlank()) {
            enviarNotificacaoConclusaoWhatsApp(osSalva);
        }

        log.info("Ordem de Serviço #{} finalizada com sucesso. Total: R$ {}", os.getId(), os.getValorTotal());
        return osSalva;
    }

    private void enviarNotificacaoConclusaoWhatsApp(OrdemServico os) {
        String msg = String.format(
            "🚗 *DOMÍNIO LUBRIFICANTES - SERVIÇO CONCLUÍDO!* 🛢️\n\n" +
            "Olá *%s*! O serviço do seu veículo (*%s - Placa: %s*) foi concluído com sucesso.\n\n" +
            "📋 *OS Nº:* #%d\n" +
            "💰 *Valor Total:* R$ %.2f\n\n" +
            "Agradecemos a preferência e confiança no nosso trabalho!",
            os.getClienteNome(),
            os.getVeiculoModelo() != null ? os.getVeiculoModelo() : "Veículo",
            os.getVeiculoPlaca(),
            os.getId(),
            os.getValorTotal()
        );

        try {
            whatsappService.enviarMensagemTexto(os.getClienteWhatsapp(), msg);
        } catch (Exception e) {
            log.error("Erro ao enviar mensagem no WhatsApp do cliente: {}", e.getMessage());
        }
    }

    public OrdemServico buscarPorId(Long id) {
        return ordemServicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ordem de Serviço não encontrada com ID: " + id));
    }

    public List<OrdemServico> listarTodas() {
        return ordemServicoRepository.findAll();
    }

    public List<OrdemServico> buscarPorPlaca(String placa) {
        return ordemServicoRepository.findByVeiculoPlacaIgnoreCaseOrderByDataCriacaoDesc(placa.replaceAll("\\s+", ""));
    }
}