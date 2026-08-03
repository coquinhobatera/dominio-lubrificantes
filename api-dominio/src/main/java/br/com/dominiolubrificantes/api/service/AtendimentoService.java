package br.com.dominiolubrificantes.api.service;

import br.com.dominiolubrificantes.api.dto.request.NovaTrocaRequest;
import br.com.dominiolubrificantes.api.dto.response.AtendimentoResponse;
import br.com.dominiolubrificantes.api.entity.*;
import br.com.dominiolubrificantes.api.exception.ResourceNotFoundException;
import br.com.dominiolubrificantes.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AtendimentoService {

    private final ClienteRepository clienteRepository;
    private final VeiculoRepository veiculoRepository;
    private final TrocaOleoRepository trocaOleoRepository;
    
    // Injeção do serviço do WhatsApp e de Produtos/Estoque
    private final WhatsappService whatsappService;
    private final ProdutoService produtoService; // 📦 Novo!

    @Transactional
    public void registrarTroca(NovaTrocaRequest request) {
        String placaFormatada = request.getPlaca().toUpperCase().replaceAll("[^A-Z0-9]", "");

        // 1. Busca ou cria/atualiza o Cliente
        Cliente cliente = clienteRepository.findByWhatsapp(request.getWhatsapp())
                .map(c -> {
                    if (request.getNomeCliente() != null && !request.getNomeCliente().isBlank()) {
                        c.setNome(request.getNomeCliente());
                    }
                    return clienteRepository.save(c);
                })
                .orElseGet(() -> {
                    Cliente novoCliente = new Cliente();
                    novoCliente.setNome(request.getNomeCliente());
                    novoCliente.setWhatsapp(request.getWhatsapp());
                    return clienteRepository.save(novoCliente);
                });

        // 2. Busca ou cria/atualiza o Veículo
        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(placaFormatada)
                .map(v -> {
                    if (request.getModelo() != null && !request.getModelo().isBlank()) {
                        v.setModelo(request.getModelo());
                    }
                    if (request.getMarca() != null && !request.getMarca().isBlank()) {
                        v.setMarca(request.getMarca());
                    }
                    if (request.getAno() != null) {
                        v.setAno(request.getAno());
                    }
                    v.setCliente(cliente);
                    return veiculoRepository.save(v);
                })
                .orElseGet(() -> {
                    Veiculo novoVeiculo = new Veiculo();
                    novoVeiculo.setPlaca(placaFormatada);
                    novoVeiculo.setModelo(request.getModelo());
                    novoVeiculo.setMarca(request.getMarca());
                    novoVeiculo.setAno(request.getAno());
                    novoVeiculo.setCliente(cliente);
                    return veiculoRepository.save(novoVeiculo);
                });

        // 3. 📦 Baixa automática dos itens do estoque
        if (request.getProdutoOleoId() != null && request.getQuantidadeLitros() != null) {
            produtoService.darBaixa(request.getProdutoOleoId(), request.getQuantidadeLitros());
        }
        if (request.getProdutoFiltroOleoId() != null) {
            produtoService.darBaixa(request.getProdutoFiltroOleoId(), BigDecimal.ONE);
        }
        if (request.getProdutoFiltroArId() != null) {
            produtoService.darBaixa(request.getProdutoFiltroArId(), BigDecimal.ONE);
        }

        // 4. Registra a Troca com o cálculo de 6 Meses
        TrocaOleo troca = new TrocaOleo();
        troca.setVeiculo(veiculo);
        troca.setDataTroca(LocalDate.now());
        troca.setKmAtual(request.getKmAtual());
        troca.setDescricaoServico(request.getDescricaoServico());
        
        // Soma automática de 6 meses
        troca.setDataLembrete(LocalDate.now().plusMonths(6));
        troca.setStatusLembrete(StatusLembrete.PENDENTE);

        TrocaOleo trocaSalva = trocaOleoRepository.save(troca);

        // Disparo automático do comprovante via WhatsApp no momento do registro
        try {
            if (cliente.getWhatsapp() != null && !cliente.getWhatsapp().isBlank()) {
                int kmExibicao = (trocaSalva.getKmAtual() != null) ? trocaSalva.getKmAtual() : 0;

                String mensagem = String.format(
                    "Olá *%s*! 👋\n\n" +
                    "Agradecemos pela preferência em realizar a manutenção do seu veículo na *Domínio Lubrificantes*! 🛢️🚗\n\n" +
                    "📋 *COMPROVANTE DE SERVIÇO*\n" +
                    "───────────────\n" +
                    "🚘 *Veículo:* %s\n" +
                    "🏷️ *Placa:* %s\n" +
                    "📏 *KM Atual:* %d KM\n" +
                    "🛠️ *Serviço:* %s\n" +
                    "───────────────\n\n" +
                    "📅 *PRÓXIMA TROCA RECOMENDADA:*\n" +
                    "Em 6 meses (%s) ou ao atingir a próxima quilometragem recomendada.\n\n" +
                    "Qualquer dúvida, estamos à disposição neste número! 🛠️✨",
                    cliente.getNome(),
                    veiculo.getModelo() != null ? veiculo.getModelo() : "Veículo",
                    veiculo.getPlaca(),
                    kmExibicao,
                    trocaSalva.getDescricaoServico() != null ? trocaSalva.getDescricaoServico() : "Troca de Óleo / Filtro",
                    trocaSalva.getDataLembrete()
                );

                whatsappService.enviarMensagemTexto(cliente.getWhatsapp(), mensagem);
                log.info("Comprovante enviado com sucesso via WhatsApp para {}", cliente.getWhatsapp());
            }
        } catch (Exception e) {
            log.error("Erro ao enviar comprovante automático no WhatsApp: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public AtendimentoResponse buscarPorPlaca(String placa) {
        String placaFormatada = placa.toUpperCase().replaceAll("[^A-Z0-9]", "");

        Veiculo veiculo = veiculoRepository.findByPlacaIgnoreCase(placaFormatada)
                .orElseThrow(() -> new ResourceNotFoundException("Veículo não encontrado com a placa: " + placaFormatada));

        List<TrocaOleo> historico = trocaOleoRepository.findByVeiculoPlacaIgnoreCaseOrderByDataTrocaDesc(placaFormatada);

        return montarAtendimentoResponse(veiculo, historico);
    }

    @Transactional(readOnly = true)
    public List<AtendimentoResponse> listarTodos() {
        List<Veiculo> veiculos = veiculoRepository.findAll();

        return veiculos.stream().map(veiculo -> {
            List<TrocaOleo> historico = trocaOleoRepository
                    .findByVeiculoPlacaIgnoreCaseOrderByDataTrocaDesc(veiculo.getPlaca());
            return montarAtendimentoResponse(veiculo, historico);
        }).toList();
    }

    @Transactional
    public void atualizarStatusLembrete(Long trocaId, StatusLembrete novoStatus) {
        TrocaOleo troca = trocaOleoRepository.findById(trocaId)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de troca de óleo não encontrado com ID: " + trocaId));

        troca.setStatusLembrete(novoStatus);
        trocaOleoRepository.save(troca);
    }

    // Método privado auxiliar para mapeamento do Response
    private AtendimentoResponse montarAtendimentoResponse(Veiculo veiculo, List<TrocaOleo> historico) {
        AtendimentoResponse response = new AtendimentoResponse();
        response.setPlaca(veiculo.getPlaca());
        response.setModelo(veiculo.getModelo());
        response.setMarca(veiculo.getMarca());
        response.setAno(veiculo.getAno());

        if (veiculo.getCliente() != null) {
            response.setNomeCliente(veiculo.getCliente().getNome());
            response.setWhatsapp(veiculo.getCliente().getWhatsapp());
        }

        // Preenche os dados da última troca no nível superior do DTO
        if (!historico.isEmpty()) {
            TrocaOleo ultimaTroca = historico.get(0);
            response.setKmAtual(ultimaTroca.getKmAtual());
            response.setDescricaoServico(ultimaTroca.getDescricaoServico());
            response.setDataLembrete(ultimaTroca.getDataLembrete());
            
            if (ultimaTroca.getStatusLembrete() != null) {
                response.setStatusLembrete(ultimaTroca.getStatusLembrete());
            }
        }

        List<AtendimentoResponse.TrocaHistoricoDto> historicoDto = historico.stream().map(t -> {
            AtendimentoResponse.TrocaHistoricoDto dto = new AtendimentoResponse.TrocaHistoricoDto();
            dto.setId(t.getId());
            dto.setDataTroca(t.getDataTroca());
            dto.setKmAtual(t.getKmAtual());
            dto.setDescricaoServico(t.getDescricaoServico());
            dto.setDataLembrete(t.getDataLembrete());
            
            if (t.getStatusLembrete() != null) {
                dto.setStatusLembrete(t.getStatusLembrete());
            }
            return dto;
        }).toList();

        response.setHistoricoTrocas(historicoDto);
        return response;
    }
}