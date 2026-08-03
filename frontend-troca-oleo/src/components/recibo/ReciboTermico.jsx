import React from 'react';
import './ReciboTermico.css';

export const ReciboTermico = ({ atendimento }) => {
  if (!atendimento) return null;

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div id="comprovante-termico" className="recibo-container">
      <div className="recibo-header">
        <h2>DOMÍNIO LUBRIFICANTES</h2>
        <p>Troca de Óleo e Filtros</p>
        <p>Rua Exemplo, 123 - Centro</p>
        <p>Tel/WhatsApp: (24) 99999-9999</p>
        <div className="linha-divisoria">--------------------------------</div>
        <p className="recibo-titulo">COMPROVANTE DE SERVIÇO</p>
        <p>{dataAtual}</p>
      </div>

      <div className="linha-divisoria">--------------------------------</div>

      <div className="recibo-secao">
        <p><strong>CLIENTE:</strong> {atendimento.nomeCliente || 'Cliente Balcão'}</p>
        <p><strong>TEL:</strong> {atendimento.whatsapp || '-'}</p>
        <p><strong>VEÍCULO:</strong> {atendimento.marca} {atendimento.modelo}</p>
        <p><strong>PLACA:</strong> {atendimento.placa}</p>
        <p><strong>ANO:</strong> {atendimento.ano || '-'}</p>
      </div>

      <div className="linha-divisoria">--------------------------------</div>

      <div className="recibo-secao">
        <p><strong>DETALHES DO SERVIÇO</strong></p>
        <p><strong>KM ATUAL:</strong> {atendimento.kmAtual} km</p>
        <p><strong>ÓLEO:</strong> {atendimento.oleoUtilizado || 'Não informado'}</p>
        <p><strong>FILTRO:</strong> {atendimento.filtroOleo || 'Não informado'}</p>
        {atendimento.descricaoServico && (
          <p><strong>OBS:</strong> {atendimento.descricaoServico}</p>
        )}
      </div>

      <div className="linha-divisoria">--------------------------------</div>

      <div className="recibo-secao recibo-total">
        <p><strong>FORMA PAGTO:</strong> {atendimento.formaPagamento || 'PIX'}</p>
        <h3>TOTAL: R$ {Number(atendimento.valorTotal || 0).toFixed(2)}</h3>
      </div>

      <div className="linha-divisoria">--------------------------------</div>

      <div className="recibo-footer">
        <p><strong>PRÓXIMA TROCA RECOMENDADA:</strong></p>
        <p className="destaque-retorno">6 MESES ou +10.000 KM</p>
        <p>Obrigado pela preferência!</p>
      </div>
    </div>
  );
};