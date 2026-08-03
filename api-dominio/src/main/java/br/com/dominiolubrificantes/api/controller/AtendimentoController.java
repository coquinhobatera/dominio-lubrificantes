package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.dto.request.NovaTrocaRequest;
import br.com.dominiolubrificantes.api.dto.response.AtendimentoResponse;
import br.com.dominiolubrificantes.api.entity.StatusLembrete;
import br.com.dominiolubrificantes.api.service.AtendimentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atendimentos")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class AtendimentoController {

    private final AtendimentoService atendimentoService;

    @PostMapping
    public ResponseEntity<Void> registrarTroca(@Valid @RequestBody NovaTrocaRequest request) {
        atendimentoService.registrarTroca(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<AtendimentoResponse>> listarTodos() {
        return ResponseEntity.ok(atendimentoService.listarTodos());
    }

    @GetMapping("/{placa}")
    public ResponseEntity<AtendimentoResponse> buscarPorPlaca(@PathVariable String placa) {
        return ResponseEntity.ok(atendimentoService.buscarPorPlaca(placa));
    }

    // 🟢 Novo Endpoint: Atualiza o status do lembrete da troca de óleo
    @PatchMapping("/{trocaId}/lembrete")
    public ResponseEntity<Void> atualizarStatusLembrete(
            @PathVariable Long trocaId,
            @RequestParam StatusLembrete status) {
        
        atendimentoService.atualizarStatusLembrete(trocaId, status);
        return ResponseEntity.noContent().build();
    }
}