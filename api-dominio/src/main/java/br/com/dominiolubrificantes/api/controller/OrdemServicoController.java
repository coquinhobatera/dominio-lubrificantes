package br.com.dominiolubrificantes.api.controller;

import br.com.dominiolubrificantes.api.dto.OrdemServicoDTO;
import br.com.dominiolubrificantes.api.entity.OrdemServico;
import br.com.dominiolubrificantes.api.service.OrdemServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordens-servico")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrdemServicoController {

    private final OrdemServicoService osService;

    @GetMapping
    public ResponseEntity<List<OrdemServico>> listarTodas() {
        return ResponseEntity.ok(osService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServico> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(osService.buscarPorId(id));
    }

    @GetMapping("/veiculo/{placa}")
    public ResponseEntity<List<OrdemServico>> buscarPorPlaca(@PathVariable String placa) {
        return ResponseEntity.ok(osService.buscarPorPlaca(placa));
    }

    @PostMapping
    public ResponseEntity<OrdemServico> criarOS(@RequestBody @Valid OrdemServicoDTO dto) {
        OrdemServico novaOS = osService.criarOrdemServico(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(novaOS);
    }

    @PutMapping("/{id}/finalizar")
    public ResponseEntity<OrdemServico> finalizarOS(@PathVariable Long id) {
        OrdemServico osConcluida = osService.finalizarOrdemServico(id);
        return ResponseEntity.ok(osConcluida);
    }
}