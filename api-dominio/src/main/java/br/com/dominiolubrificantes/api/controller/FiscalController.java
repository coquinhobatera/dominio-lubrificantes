package br.com.dominiolubrificantes.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import br.com.dominiolubrificantes.api.dto.request.EmissaoNfceRequestDTO;

@RestController
@RequestMapping("/api/fiscal")
@CrossOrigin(origins = "*") // Permite chamadas do frontend React
public class FiscalController {

    @PostMapping("/emitir-nfce")
    public ResponseEntity<?> emitirNfce(@RequestBody EmissaoNfceRequestDTO request) {
        try {
            // Por enquanto, vamos apenas simular o recebimento e logar no console
            System.out.println("Recebido pedido de emissão de NFC-e para " + request.itens().size() + " itens.");
            System.out.println("Valor Total: R$ " + request.valorTotalVenda());

            // Aqui futuramente chamaremos o serviço da API parceira (FocusNFe, TecnoSpeed, etc.)
            
            // Retornamos um sucesso simulado com um link de exemplo para o DANFE/PDF
            return ResponseEntity.ok(new RespostaFiscalDTO(
                "AUTORIZADO", 
                "12345678901234567890123456789012345678901234", 
                "https://exemplo.com/danfe-simulado.pdf"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao emitir NFC-e: " + e.getMessage());
        }
    }

    // Record auxiliar para a resposta simulada
    public record RespostaFiscalDTO(String status, String chaveAcesso, String urlPdf) {}
}