package br.com.dominiolubrificantes.api.service;

import br.com.dominiolubrificantes.api.entity.Cliente;
import br.com.dominiolubrificantes.api.entity.Veiculo;
import br.com.dominiolubrificantes.api.repository.VeiculoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class VeiculoService {

    private final VeiculoRepository veiculoRepository;

       VeiculoService(VeiculoRepository veiculoRepository) {
              this.veiculoRepository = veiculoRepository;
       }

    public Optional<Veiculo> buscarPorPlaca(String placa) {
        return veiculoRepository.findByPlacaIgnoreCase(placa);
    }

    @Transactional
    public Veiculo salvarOuAtualizar(String placa, String modelo, String nomeCliente, String whatsapp) {
        String placaFormatada = placa.toUpperCase();

        return veiculoRepository.findByPlacaIgnoreCase(placaFormatada)
                .map(veiculoExistente -> {
                    // 1. Atualiza os dados do Veículo
                    if (modelo != null && !modelo.isBlank()) {
                        veiculoExistente.setModelo(modelo);
                    }

                    // 2. Se o veículo já existe, atualizamos os dados direto no cliente vinculado:
                    if (veiculoExistente.getCliente() != null) {
                        if (nomeCliente != null && !nomeCliente.isBlank()) {
                            veiculoExistente.getCliente().setNome(nomeCliente);
                        }
                        if (whatsapp != null && !whatsapp.isBlank()) {
                            veiculoExistente.getCliente().setWhatsapp(whatsapp);
                        }
                    } else {
                        // Caso de exceção: veículo existia sem cliente cadastrado
                        Cliente novoCliente = new Cliente();
                        novoCliente.setNome(nomeCliente);
                        novoCliente.setWhatsapp(whatsapp);
                        veiculoExistente.setCliente(novoCliente);
                    }

                    return veiculoRepository.save(veiculoExistente);
                })
                .orElseGet(() -> {
                    // 3. Se for veículo NOVO, cria o Cliente e o Veículo do zero:
                    Cliente novoCliente = new Cliente();
                    novoCliente.setNome(nomeCliente);
                    novoCliente.setWhatsapp(whatsapp);

                    Veiculo novoVeiculo = new Veiculo();
                    novoVeiculo.setPlaca(placaFormatada);
                    novoVeiculo.setModelo(modelo);
                    novoVeiculo.setCliente(novoCliente); // Associa o cliente ao veículo

                    return veiculoRepository.save(novoVeiculo);
                });
    }
}