package br.com.dominiolubrificantes.api.dto.request;

import java.util.List;

import br.com.dominiolubrificantes.api.dto.ItemVendaDTO;
import br.com.dominiolubrificantes.api.dto.PagamentoDTO;

public record EmissaoNfceRequestDTO(
    List<ItemVendaDTO> itens,
    List<PagamentoDTO> pagamentos,
    double valorTotalVenda,
    double desconto
) {}