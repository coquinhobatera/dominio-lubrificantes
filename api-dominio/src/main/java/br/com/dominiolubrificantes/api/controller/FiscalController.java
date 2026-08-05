package br.com.dominiolubrificantes.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import br.com.dominiolubrificantes.api.dto.RespostaFiscalDTO;
import br.com.dominiolubrificantes.api.dto.request.EmissaoNfeRequestDTO;

@RestController
@RequestMapping("/api/fiscal")
@CrossOrigin(origins = "*")
public class FiscalController {

    // 1. Cupom Fiscal (NFC-e - Modelo 65)
    @PostMapping("/emitir-nfce")
    public ResponseEntity<?> emitirNfce(@RequestBody EmissaoNfeRequestDTO request) {
        try {
            System.out.println("Emitindo NFC-e (Balcão) para " + request.itens().size() + " itens.");
            
            return ResponseEntity.ok(new RespostaFiscalDTO(
                "AUTORIZADO", 
                "35260412345678000190650010000000011234567890", 
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao emitir NFC-e: " + e.getMessage());
        }
    }

    // 2. Nota Fiscal Completa (NF-e - Modelo 55)
    @PostMapping("/emitir-nfe")
    public ResponseEntity<?> emitirNfe(@RequestBody EmissaoNfeRequestDTO request) {
        try {
            System.out.println("Emitindo NF-e (Modelo 55) para o cliente: " + request.destinatario().nome());
            
            return ResponseEntity.ok(new RespostaFiscalDTO(
                "AUTORIZADO", 
                "35260412345678000190550010000000029876543210", 
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao emitir NF-e: " + e.getMessage());
        }
    }

    // 3. Consultar Status de Nota por Chave de Acesso
    @GetMapping("/consultar/{chaveAcesso}")
    public ResponseEntity<?> consultarNota(@PathVariable String chaveAcesso) {
        try {
            System.out.println("Consultando nota com chave: " + chaveAcesso);
            
            return ResponseEntity.ok(new RespostaFiscalDTO(
                "AUTORIZADO", 
                chaveAcesso, 
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao consultar nota: " + e.getMessage());
        }
    }

    // 4. Cancelar Nota Fiscal
    @PostMapping("/cancelar")
    public ResponseEntity<?> cancelarNota(@RequestParam String chaveAcesso, @RequestParam String justificativa) {
        try {
            System.out.println("Cancelando nota " + chaveAcesso + ". Justificativa: " + justificativa);
            
            return ResponseEntity.ok(new RespostaFiscalDTO(
                "CANCELADO", 
                chaveAcesso, 
                "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao cancelar nota: " + e.getMessage());
        }
    }
}