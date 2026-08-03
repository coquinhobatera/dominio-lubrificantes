package br.com.dominiolubrificantes.api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_produtos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    private String marca;

    private String codigoBarras;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoProduto tipo;

    @Column(nullable = false)
    private BigDecimal quantidadeEstoque;

    @Column(nullable = false)
    private BigDecimal estoqueMinimo;

    private BigDecimal precoCusto;

    private BigDecimal precoVenda;

    // Método utilitário para verificar se precisa repor
    public boolean isEstoqueBaixo() {
        return this.quantidadeEstoque != null 
            && this.estoqueMinimo != null 
            && this.quantidadeEstoque.compareTo(this.estoqueMinimo) <= 0;
    }
}