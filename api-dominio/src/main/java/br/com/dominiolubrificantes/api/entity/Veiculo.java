package br.com.dominiolubrificantes.api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_veiculos")
@Getter 
@Setter 
@NoArgsConstructor 
@AllArgsConstructor
public class Veiculo {

    @Id
    @Column(length = 10, nullable = false, unique = true)
    private String placa; // Placa em maiúsculas (ex: ABC1D23)

    private String modelo;
    private String marca;
    private String ano;

    // Adicionado cascade para salvar/atualizar o cliente automaticamente
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
}