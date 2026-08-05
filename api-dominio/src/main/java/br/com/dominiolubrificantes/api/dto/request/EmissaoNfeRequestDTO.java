package br.com.dominiolubrificantes.api.dto.request;

import java.util.List;

import br.com.dominiolubrificantes.api.dto.DestinatarioDTO;
import br.com.dominiolubrificantes.api.dto.ItemVendaDTO;
import br.com.dominiolubrificantes.api.dto.PagamentoDTO;

// DTO para NF-e Completa (Modelo 55 - Exige Destinatário e Endereço)
    public record EmissaoNfeRequestDTO(
        DestinatarioDTO destinatario,
        List<ItemVendaDTO> itens,
        List<PagamentoDTO> pagamentos,
        Double valorTotalVenda,
        Double desconto
    ) {}